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
    <div className="flex w-[1000px] h-[700px] rounded-lg overflow-hidden">
      {/* All friends will be left */}
      <div className="w-[300px] flex flex-col bg-indigo-900 text-white overflow-auto">
        <div className="px-4 flex w-full items-center justify-between pt-2 h-[60px]">
          <div className="hidden">
            <h3 className="font-bold">Your Friends</h3>
          </div>

          {/* Search User */}
          <div className="w-full rounded-md">
            <input
              type="text"
              placeholder="Search User"
              className="rounded-md p-2 w-full text-black outline-none text-center"
              onChange={(e) => setSearchUser(e.target.value)}
              value={searchUser}
            />
          </div>
        </div>

        {/* Search result */}
        <div
          className={`${
            searchUser ? "flex" : "hidden"
          } flex-col gap-4 bg-white/80 text-black`}
        >
          {searchResult.length > 0 &&
            searchResult.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-center gap-2 cursor-pointer p-2 transition-all duration-150 ease-out hover:bg-indigo-300 hover:shadow-md hover:text-black"
                onClick={() => startChat(user)}
              >
                <User /> {user.name}
              </div>
            ))}
        </div>

        {/* List All Active Chats */}
        <ul
          className={`${
            searchUser ? "hidden" : "flex"
          } flex-col text-sm gap-4 bg-indigo-900/85 px-2 py-4`}
        >
          {activeChats.length > 0 ? (
            activeChats.map((chat) => (
              <li
                key={chat.id}
                className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg transition-all duration-150 ease-out hover:bg-indigo-300 hover:shadow-md hover:text-black ${
                  activeChat?.id === chat.id ? "bg-indigo-300 text-black" : ""
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <User className="w-6 h-6" />
                <div className="flex flex-col">
                  <span className="font-medium">{chat.user.name}</span>
                  {chat.lastMessage && (
                    <span className="text-xs opacity-70 truncate w-48">
                      {chat.lastMessage.message}
                    </span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-center py-4 text-indigo-200">
              No active chats. Search for users to start chatting!
            </li>
          )}
        </ul>
      </div>

      {/* Welcome Screen (no active chat) */}
      <div
        className={` ${
          activeChat ? "hidden" : "flex"
        } flex-col items-center justify-center w-[800px] bg-blue-100`}
      >
        <h1 className="text-2xl font-semibold flex flex-col items-center gap-8">
          <UserIcon className="w-12 h-12" />
          Select User to Chat
        </h1>
      </div>

      {/* Active Chat Area */}
      <div
        className={` ${
          activeChat ? "flex" : "hidden"
        } flex-col w-[800px] bg-indigo-900`}
      >
        {/* Chat Header */}
        <div className="pl-6 flex h-[60px] text-white w-full items-center justify-between">
          <div className="font-bold">{activeChat?.user?.name}</div>
          <div className="flex items-center gap-4 mr-12 ">
            <div className="flex mr-4 items-center justify-center gap-2">
              <VideoIcon /> Video Call
            </div>
            <div className="flex items-center justify-center gap-2">
              <AudioLinesIcon /> Audio Call
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex flex-col h-[640px] w-full bg-blue-100 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === currentUser?.id
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-gray-200 text-black rounded-tl-none"
                }`}
              >
                <p>{message.text}</p>
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

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 p-3 rounded-lg text-black">
                <p>Typing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="h-[100px] bg-white p-4 flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-md p-3 focus:outline-none focus:border-indigo-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            onFocus={handleTyping}
            onBlur={handleStopTyping}
          />
          <button
            className="bg-indigo-600 text-white p-3 rounded-r-md"
            onClick={handleSendMessage}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
