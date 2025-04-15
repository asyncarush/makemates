import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { ChatService } from "@/services/ChatService";

export interface Message {
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
}

export const useChat = (
  socket: Socket | null,
  chatService: ChatService,
  activeChat: { id: string; user: User } | null,
  currentUser: User | null
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const messages = await chatService.fetchMessages(activeChat.id);
        setMessages(messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    chatService.joinChat(activeChat.id);
    loadMessages();

    return () => {
      if (activeChat) {
        chatService.leaveChat(activeChat.id);
      }
    };
  }, [activeChat, chatService]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTyping = ({
      userId,
      chatId,
    }: {
      userId: string;
      chatId: string;
    }) => {
      if (activeChat?.id === chatId && userId !== currentUser?.id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({
      userId,
      chatId,
    }: {
      userId: string;
      chatId: string;
    }) => {
      if (activeChat?.id === chatId && userId !== currentUser?.id) {
        setIsTyping(false);
      }
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [socket, activeChat, currentUser]);

  const sendMessage = () => {
    if (!socket || !activeChat || !newMessage.trim() || !currentUser) return;

    const messageData = {
      chatId: activeChat.id,
      senderId: currentUser.id,
      text: newMessage,
    };

    chatService.socketService.emitMessage(messageData);
    setNewMessage("");
  };

  const handleTypingStatus = (isTyping: boolean) => {
    if (!socket || !activeChat || !currentUser) return;

    if (isTyping) {
      chatService.socketService.emitTyping(activeChat.id, currentUser.id);
    } else {
      chatService.socketService.emitStopTyping(activeChat.id, currentUser.id);
    }
  };

  return {
    messages,
    isTyping,
    newMessage,
    setNewMessage,
    sendMessage,
    handleTypingStatus,
  };
};
