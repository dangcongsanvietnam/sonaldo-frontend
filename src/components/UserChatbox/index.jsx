import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Button, Drawer, List, Typography, message } from "antd";
import { MessageOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { addMessage, setMessages } from "../../slices/chatSlice";

export default function UserChatbox() {
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const messages = useSelector((state) => state.chat.messages);
    const userId = localStorage.getItem("userId");
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    useEffect(() => {
        if (open && messages.length === 0) {
            setLoadingMessages(true); // Start loading
            axios
                .get(`http://localhost:8080/api/v1/chat/${userId}`)
                .then((response) => {
                    dispatch(setMessages(response.data));
                })
                .catch(() => {
                    message.error("Failed to load chat messages.");
                })
                .finally(() => {
                    setLoadingMessages(false); // Stop loading
                });
        }
    }, [open, userId, dispatch, messages.length]);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.debug = () => { }; // Disable logs

        client.connect({}, () => {
            client.subscribe("/topic/messages", (message) => {
                const receivedMessage = JSON.parse(message.body);

                // Prevent duplicate messages using createdAt
                if (!messages.some(m => m.userId === receivedMessage.userId && m.content === receivedMessage.content && m.createdAt === receivedMessage.createdAt)) {
                    dispatch(addMessage(receivedMessage));
                }
            });

            setStompClient(client);
        });

        return () => {
            client.disconnect(() => console.log("Disconnected"));
        };
    }, [dispatch, messages]); // Add messages to dependency array to avoid stale state

    const sendMessage = () => {
        if (!input.trim() || !stompClient || !stompClient.connected) {
            message.error("WebSocket not connected or empty message!");
            return;
        }

        const newMessage = {
            userId,
            content: input,
            role,
        };

        // Send message via WebSocket
        stompClient.send("/app/send", {}, JSON.stringify(newMessage));

        // Optimistic update with createdAt check
        // if (!messages.some(m => m.userId === newMessage.userId && m.content === newMessage.content && m.createdAt === newMessage.createdAt)) {
        //     dispatch(addMessage(newMessage));
        // }

        setInput("");
    };

    return (
        <>
            {/* Chat Icon Button */}
            <Button
                type="primary"
                shape="circle"
                icon={<MessageOutlined />}
                size="large"
                className="fixed bottom-10 right-10 shadow-md"
                onClick={() => setOpen(true)}
                style={{ zIndex: "10000" }}
            />

            {/* Chat Drawer */}
            <Drawer
                title="Support Chat"
                placement="right"
                closable={false}
                onClose={() => setOpen(false)}
                open={open}
                width={350}
                extra={<CloseOutlined onClick={() => setOpen(false)} />}
                zIndex={10000}
                className="pb-10"
            >
                <List
                    itemLayout="horizontal"
                    loading={loadingMessages}
                    dataSource={[...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))}
                    renderItem={(msg) => (
                        <div
                            className={`flex ${msg.role === "ROLE_ADMIN" ? "justify-start" : "justify-end"} mb-2`}
                        >
                            <div
                                className={`p-2 max-w-[75%] rounded-lg ${msg.role === "ROLE_ADMIN"
                                    ? "bg-gray-200 text-black" // Admin messages on the left
                                    : "bg-blue-500 text-white" // User messages on the right
                                    }`}
                            >
                                <Typography.Text>{msg.content}</Typography.Text>
                            </div>
                        </div>
                    )}
                />

                <div ref={messagesEndRef} /> {/* Scroll to bottom */}

                {/* Input Field */}
                <div className="absolute bottom-0 left-0 w-full bg-white p-2 border-t flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        onPressEnter={sendMessage}
                    />
                    <Button loading={submitLoading} type="primary" icon={<SendOutlined />} onClick={sendMessage} />
                </div>
            </Drawer>
        </>
    );
}
