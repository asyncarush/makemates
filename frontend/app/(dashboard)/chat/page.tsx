"use client";

import { ChatContext } from "@/app/context/ChatContext";
import { AuthContext } from "@/app/context/AuthContext";
import { AudioLinesIcon, Send, User, UserIcon, VideoIcon } from "lucide-react";
import { useContext, useState, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useChat } from "@/hooks/useChat";
import { useVideoCall } from "@/hooks/useVideoCall";
import { SocketService } from "@/services/SocketService";
import { ChatService, Chat, ChatUser } from "@/services/ChatService";

const Page = () => {
  const router = useRouter();
  const { socketRef } = useContext(ChatContext) || {};
  const { currentUser } = useContext(AuthContext) || {};
  const socket = socketRef?.current || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize services
  const socketService = useMemo(
    () => (socket ? new SocketService(socket) : null),
    [socket]
  );

  const chatService = useMemo(
    () => (socketService ? new ChatService(socketService) : null),
    [socketService]
  );

  // Local state
  const [searchUser, setSearchUser] = useState("");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchResult, setSearchResult] = useState<ChatUser[]>([]);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);

  // Custom hooks
  const { onlineUsers, isUserOnline } = useOnlineStatus(socket);
  const {
    messages,
    isTyping,
    newMessage,
    setNewMessage,
    sendMessage,
    handleTypingStatus,
  } = useChat(socket, chatService!, activeChat, currentUser, socketService!);

  const {
    incomingCall,
    isWaitingForResponse,
    initiateCall,
    acceptCall,
    rejectCall,
  } = useVideoCall(socket, socketService!, router, currentUser);

  // Load active chats
  useEffect(() => {
    const fetchActiveChats = async () => {
      if (!chatService) return;
      try {
        const chats = await chatService.fetchActiveChats();
        setActiveChats(chats);
      } catch (error) {
        console.error("Error fetching active chats:", error);
      }
    };

    fetchActiveChats();
  }, [chatService]);

  // Handle search
  useEffect(() => {
    if (!searchUser || !chatService) return;

    const debounce = setTimeout(async () => {
      try {
        const results = await chatService.searchUsers(searchUser);
        setSearchResult(results);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchUser, chatService]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async (user: ChatUser) => {
    if (!chatService) return;
    try {
      const chat = await chatService.createChat(user.id);
      setActiveChat(chat);
      console.log("Active Chat set", activeChat);
      setSearchUser("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <div className="flex w-full max-w-6xl mx-auto h-[calc(100vh-140px)] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Incoming Call Notification */}

      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-2">Incoming Video Call</h3>
            <p className="text-gray-600 mb-4">
              {incomingCall.callerName} is calling you...
            </p>
            <div className="flex gap-4">
              <Button
                onClick={acceptCall}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
              <Button
                onClick={rejectCall}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Chat List */}
      <div className="w-[320px] flex flex-col bg-gray-50 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            onChange={(e) => setSearchUser(e.target.value)}
            value={searchUser}
          />
        </div>

        {/* Search Results */}
        <div className={searchUser ? "flex-1 overflow-y-auto" : "hidden"}>
          {searchResult.length > 0 ? (
            searchResult.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                onClick={() => startChat(user)}
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-700">{user.name}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>

        {/* Active Chats */}
        <div
          className={`${
            searchUser ? "hidden" : "flex"
          } flex-col flex-1 overflow-y-auto`}
        >
          {activeChats.length > 0 ? (
            activeChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 ${
                  activeChat?.id === chat.id
                    ? "bg-indigo-50 border-l-4 border-indigo-500"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="relative w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <div
                    className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${
                      isUserOnline(chat.user.id)
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {chat.user.name}
                    </span>
                    <span
                      className={`text-xs ${
                        isUserOnline(chat.user.id)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {isUserOnline(chat.user.id) ? "online" : "offline"}
                    </span>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage.message}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <User className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-center">
                No active chats. Search for users to start chatting!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Screen */}
        {!activeChat && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome to Chat
              </h2>
              <p className="mt-2 text-gray-500">
                Select a conversation or start a new one
              </p>
            </div>
          </div>
        )}

        {/* Active Chat View */}
        {activeChat && (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 ${
                      isUserOnline(activeChat?.user?.id)
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activeChat.user.name}
                  </h3>
                  {isTyping ? (
                    <span className="text-sm text-gray-500">typing...</span>
                  ) : (
                    <span
                      className={`text-sm ${
                        isUserOnline(activeChat.user.id)
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {isUserOnline(activeChat.user.id) ? "online" : "offline"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => initiateCall(activeChat.id)}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20"
                  disabled={isWaitingForResponse}
                >
                  <VideoIcon className="w-5 h-5" />
                </Button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <AudioLinesIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Audio</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderId === currentUser?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        message.senderId === currentUser?.id
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      <p className="break-words">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === currentUser?.id
                            ? "text-indigo-200"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTypingStatus(true);
                  }}
                  onBlur={() => handleTypingStatus(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
