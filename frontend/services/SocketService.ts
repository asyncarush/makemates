import { Socket } from "socket.io-client";

export interface MessageData {
  chatId: string;
  senderId: string;
  text: string;
}

export class SocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  emitUserOnline(userId: string) {
    this.socket.emit("userOnline", { userId: userId.toString() });
  }

  emitUserOffline(userId: string) {
    this.socket.emit("user:offline", { userId: userId.toString() });
  }

  emitMessage(messageData: MessageData) {
    this.socket.emit("send_message", messageData);
  }

  emitTyping(chatId: string, userId: string) {
    this.socket.emit("typing", { chatId, userId });
  }

  emitStopTyping(chatId: string, userId: string) {
    this.socket.emit("stop_typing", { chatId, userId });
  }

  emitVideoCallRequest(roomId: string, callerId: string, callerName: string) {
    this.socket.emit("video-call-request", {
      roomId,
      callerId,
      callerName,
    });
  }

  emitVideoCallResponse(roomId: string, receiverId: string, accepted: boolean) {
    this.socket.emit("video-call-response", {
      roomId,
      receiverId,
      accepted,
    });
  }

  joinChat(chatId: string) {
    this.socket.emit("join_chat", { chatId });
  }

  leaveChat(chatId: string) {
    this.socket.emit("leave_chat", { chatId });
  }
}
