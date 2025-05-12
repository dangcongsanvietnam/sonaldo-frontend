import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { setMessages, addMessage } from "../../slices/chatSlice";
import BASE_URL from "../../api";
import Cookies from "js-cookie";

export default function AdminChat() {
    const dispatch = useDispatch();
    const messages = useSelector((state) => state.chat.messages);
    const [activeTab, setActiveTab] = useState(null);
    const [inputs, setInputs] = useState({});
    const [stompClient, setStompClient] = useState(null);
    const role = localStorage.getItem("role");
    const messagesEndRef = useRef(null);
    const [openTabs, setOpenTabs] = useState([]); // No tabs open initially
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = Stomp.over(socket);

        client.debug = () => { }; // Disable logs

        client.connect({}, () => {
            client.subscribe("/topic/messages", (message) => {
                const receivedMessage = JSON.parse(message.body);
                dispatch(addMessage(receivedMessage));
            });
            setStompClient(client);
        });

        return () => {
            client.disconnect(() => console.log("Disconnected"));
        };
    }, [dispatch]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const jwt = Cookies.get("token");
                const response = await BASE_URL.get("/api/v1/chat/super-admin", {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                dispatch(setMessages(response.data));
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [dispatch]);

    const handleSendMessage = (userId) => {
        if (!inputs[userId] || !stompClient) return;

        const newMessage = {
            userId,
            content: inputs[userId],
            role: role,
        };

        stompClient.send("/app/send", {}, JSON.stringify(newMessage));
        setInputs({ ...inputs, [userId]: "" });
    };

    const filteredUsers = [...new Set(
        messages
            .filter(
                (msg) =>
                    msg.userId.toString().includes(searchTerm) ||
                    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((msg) => msg.userId)
    )];

    const getLatestMessage = (userId) => {
        const userMessages = messages.filter((msg) => msg.userId === userId);
        return userMessages.length ? userMessages[userMessages.length - 1].content : "";
    };

    const getLatestTime = (userId) => {
        const userMessages = messages.filter((msg) => msg.userId === userId);
        return userMessages.length
            ? new Date(userMessages[userMessages.length - 1].createdAt).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            })
            : "";
    };


    // Open chat tab only when user clicks
    const openChatTab = (userId) => {
        if (!openTabs.includes(userId)) {
            setOpenTabs((prevTabs) => [...prevTabs, userId]);
        }
        setActiveTab(userId);
    };

    // Handle closing chat tabs
    const closeChatTab = (targetKey) => {
        setOpenTabs((prevTabs) => prevTabs.filter((key) => key !== targetKey));

        if (activeTab === targetKey) {
            setActiveTab(openTabs.length > 1 ? openTabs.find((tab) => tab !== targetKey) : null);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/3 border-r p-4 flex flex-col max-h-screen">
                {/* Search Box */}
                <Input
                    placeholder="Search user ID or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />

                {/* Messages List - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map((userId) => (
                        <div
                            key={userId}
                            className="p-3 border-b cursor-pointer hover:bg-gray-100"
                            onClick={() => openChatTab(userId)}
                        >
                            <div className="font-semibold">User {userId}</div>
                            <div className="text-gray-500 text-sm truncate">
                                {getLatestMessage(userId)}
                            </div>
                            <div className="text-gray-400 text-xs">
                                {getLatestTime(userId)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Tabs */}
            <div className="w-2/3">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="editable-card"
                    hideAdd
                    onEdit={(key, action) => {
                        if (action === "remove") closeChatTab(key);
                    }}
                >
                    {openTabs.map((userId) => (
                        <Tabs.TabPane tab={`User ${userId}`} key={userId}>
                            <div className="flex flex-col h-[650px]">
                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {messages
                                        .filter((m) => m.userId === userId)
                                        .map((m, index, arr) => (
                                            <div
                                                key={m.id}
                                                ref={index === arr.length - 1 ? messagesEndRef : null}
                                                className={`flex ${m.role === "ROLE_ADMIN" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`p-2 my-1 max-w-[70%] rounded-lg ${m.role === "ROLE_ADMIN"
                                                        ? "bg-blue-500 text-white text-right"
                                                        : "bg-gray-200 text-black text-left"
                                                        }`}
                                                >
                                                    {m.content}
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Input Area - Stick to Bottom */}
                                <div className="flex gap-2 p-4 border-t bg-white">
                                    <Input
                                        value={inputs[userId] || ""}
                                        onChange={(e) => setInputs({ ...inputs, [userId]: e.target.value })}
                                        placeholder="Type a message..."
                                        onPressEnter={() => handleSendMessage(userId)}
                                    />
                                    <Button type="primary" icon={<SendOutlined />} onClick={() => handleSendMessage(userId)} />
                                </div>
                            </div>
                        </Tabs.TabPane>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
