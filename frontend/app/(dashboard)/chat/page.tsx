"use client";

import { ChatContext } from "@/app/context/ChatContext";
import { API_ENDPOINT } from "@/axios.config";
import axios from "axios";
import { AudioLinesIcon, Send, User, UserIcon, VideoIcon } from "lucide-react";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "@/app/context/AuthContext";

interface Message {
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

const Page = () => {
  const [searchUser, setSearchUser] = useState("");
  const [activeChat, setActiveChat] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socketRef } = useContext(ChatContext) || {};
  const { currentUser } = useContext(AuthContext) || {};
  const socket = socketRef?.current;

  // Load active chats on component mount
  useEffect(() => {
    const fetchActiveChats = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/chat/active`, {
          withCredentials: true,
        });
        setActiveChats(response.data);
      } catch (error) {
        console.error("Error fetching active chats:", error);
      }
    };

    fetchActiveChats();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (!searchUser) return;

    const debounce = setTimeout(() => {
      console.log("This will wait for some time", searchUser);

      const getSearchResult = async () => {
        try {
          const res = await axios.get(`${API_ENDPOINT}/chat/search/user`, {
            params: {
              keyword: searchUser,
            },
            withCredentials: true,
          });
          setSearchResult(res.data);
        } catch (error) {
          console.log(error);
        }
      };

      getSearchResult();
    }, 2000);

    return () => clearTimeout(debounce);
  }, [searchUser]);

  // Set up socket event listeners for chat
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages and acknowledgments
    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message_sent", (data: any) => {
      console.log("Message delivered:", data);
    });

    socket.on("message_error", (data: any) => {
      console.error("Message failed:", data);
    });

    // Listen for typing indicators
    socket.on(
      "user_typing",
      ({ userId, chatId }: { userId: string; chatId: string }) => {
        if (activeChat?.id === chatId && userId !== currentUser?.id) {
          setIsTyping(true);
        }
      }
    );

    socket.on(
      "user_stop_typing",
      ({ userId, chatId }: { userId: string; chatId: string }) => {
        if (activeChat?.id === chatId && userId !== currentUser?.id) {
          setIsTyping(false);
        }
      }
    );

    return () => {
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("message_error");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, activeChat, currentUser]);

  // Join chat room when active chat changes
  useEffect(() => {
    if (!socket || !activeChat) return;

    // Join the chat room
    socket.emit("join_chat", { chatId: activeChat.id });

    // Load previous messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT}/chat/messages/${activeChat.id}`,
          {
            withCredentials: true,
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    return () => {
      // Leave the chat room when component unmounts or active chat changes
      socket.emit("leave_chat", { chatId: activeChat.id });
    };
  }, [socket, activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || !activeChat || !newMessage.trim() || !currentUser) return;

    const messageData = {
      chatId: activeChat.id,
      senderId: currentUser.id,
      text: newMessage,
    };

    // Send message to server
    socket.emit("send_message", messageData);

    // Optimistically add message to local state
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Clear input
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!socket || !activeChat || !currentUser) return;
    socket.emit("typing", { chatId: activeChat.id, userId: currentUser.id });
  };

  const handleStopTyping = () => {
    if (!socket || !activeChat || !currentUser) return;
    socket.emit("stop_typing", {
      chatId: activeChat.id,
      userId: currentUser.id,
    });
  };

  const startChat = async (user: any) => {
    try {
      // Create or get existing chat
      const response = await axios.post(
        `${API_ENDPOINT}/chat/create`,
        { receiverId: user.id },
        { withCredentials: true }
      );

      setActiveChat({
        id: response.data.id,
        user,
      });

      // Clear search
      setSearchUser("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <div className="flex w-full max-w-6xl mx-auto h-[calc(100vh-140px)] bg-white rounded-xl shadow-lg overflow-hidden">
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
        <div className={`${searchUser ? "flex" : "hidden"} flex-col bg-white`}>
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
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {chat.user.name}
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
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {activeChat.user.name}
                  </h3>
                  {isTyping && (
                    <span className="text-sm text-indigo-600">typing...</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <VideoIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Video</span>
                </button>
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
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  onFocus={handleTyping}
                  onBlur={handleStopTyping}
                />
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  onClick={handleSendMessage}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
