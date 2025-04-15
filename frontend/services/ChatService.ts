import { API_ENDPOINT } from "@/axios.config";
import axios from "axios";
import { SocketService } from "./SocketService";

export interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export interface Chat {
  id: string;
  user: ChatUser;
  lastMessage?: {
    message: string;
    timestamp: string;
  };
}

export class ChatService {
  private socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  async fetchActiveChats(): Promise<Chat[]> {
    const response = await axios.get(`${API_ENDPOINT}/chat/active`, {
      withCredentials: true,
    });
    return response.data;
  }

  async searchUsers(keyword: string): Promise<ChatUser[]> {
    const response = await axios.get(`${API_ENDPOINT}/chat/search/user`, {
      params: { keyword },
      withCredentials: true,
    });
    return response.data;
  }

  async createChat(receiverId: string): Promise<Chat> {
    const response = await axios.post(
      `${API_ENDPOINT}/chat/create`,
      { receiverId },
      { withCredentials: true }
    );
    return response.data;
  }

  async fetchMessages(chatId: string) {
    const response = await axios.get(
      `${API_ENDPOINT}/chat/messages/${chatId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  joinChat(chatId: string) {
    this.socketService.joinChat(chatId);
  }

  leaveChat(chatId: string) {
    this.socketService.leaveChat(chatId);
  }
}
