"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";

import { io, Socket } from "socket.io-client";
import { AuthContext } from "@/app/context/AuthContext";
import { API_ENDPOINT } from "@/axios.config";

interface ChatContextType {
  socketRef: React.MutableRefObject<Socket | null>;
  socket: Socket | null;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => useContext(ChatContext);

export default function ChatContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const { currentUser } = useContext(AuthContext) || {};

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${API_ENDPOINT || "http://localhost:2000"}`, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        withCredentials: true,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Socket connected successfully:", socket.id);
      });

      socket.on("connection_ack", (data) => {
        console.log("Connection acknowledged by server:", data);
      });

      socket.on("userOnline:ack", (data) => {
        console.log("User online status acknowledged:", data);
      });

      socket.on("user-offline:ack", (data) => {
        console.log("User offline status acknowledged:", data);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

    
    }

    // Send online status when user is available
    const socket = socketRef.current;
    if (socket && currentUser?.id) {
      socket.emit("userOnline", { userId: currentUser.id });
    }

    // Setup beforeunload handler
    const handleBeforeUnload = () => {
      if (socket && currentUser?.id) {
        socket.emit("user-offline", { userId: currentUser.id });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Note: We don't disconnect the socket here to maintain persistent connection
      // We'll only emit offline status if the page is about to unload
    };
  }, [currentUser]);

  // Cleanup socket on component unmount (only on actual page navigation)
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("Unmounting component, disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <ChatContext.Provider value={{ socketRef, socket: socketRef.current }}>
      {children}
    </ChatContext.Provider>
  );
}
