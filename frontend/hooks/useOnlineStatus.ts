import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export const useOnlineStatus = (socket: Socket | null) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const handleUsersOnline = ({ users }: { users: string[] }) => {
      console.log("Received online users:", users);
      setOnlineUsers(new Set(users.map((id) => id.toString())));
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      console.log("User came online:", userId);
      setOnlineUsers(
        (prev) => new Set(Array.from(prev).concat(userId.toString()))
      );
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      console.log("User went offline:", userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId.toString());
        return newSet;
      });
    };

    socket.on("users:online", handleUsersOnline);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("users:online", handleUsersOnline);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [socket]);

  const isUserOnline = (userId: string | number) =>
    onlineUsers.has(userId.toString());

  return { onlineUsers, isUserOnline };
};
