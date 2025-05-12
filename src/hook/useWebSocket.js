import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import { addMessage } from "../slices/chatSlice";

const useWebSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        client.subscribe("/topic/messages", (message) => {
          dispatch(addMessage(JSON.parse(message.body)));
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [dispatch]);
};

export default useWebSocket;
