import { Server } from "socket.io";
import { logger } from "../config/winston";

export class ChatService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupChatHandlers();
  }

  private setupChatHandlers() {
    this.io.of("/chat").on("connection", (socket) => {
      logger.info(`Chat socket connected: ${socket.id}`);

      // Handle video call request
      socket.on(
        "video-call-request",
        ({
          roomId,
          callerId,
          callerName,
        }: {
          roomId: string;
          callerId: string;
          callerName: string;
        }) => {
          logger.info(
            `Video call request from ${callerName} (${callerId}) to room ${roomId}`
          );
          socket.to(roomId).emit("incoming-video-call", {
            roomId,
            callerId,
            callerName,
          });
        }
      );

      // Handle video call response
      socket.on(
        "video-call-response",
        ({
          roomId,
          receiverId,
          accepted,
        }: {
          roomId: string;
          receiverId: string;
          accepted: boolean;
        }) => {
          if (accepted) {
            logger.info(
              `Video call accepted by ${receiverId} in room ${roomId}`
            );
            socket
              .to(roomId)
              .emit("video-call-accepted", { roomId, receiverId });
          } else {
            logger.info(
              `Video call rejected by ${receiverId} in room ${roomId}`
            );
            socket
              .to(roomId)
              .emit("video-call-rejected", { roomId, receiverId });
          }
        }
      );

      // Join a chat room
      socket.on("join_chat", ({ chatId }: { chatId: string }) => {
        logger.info(`User joining chat room ${chatId}`);
        socket.join(chatId);
      });

      // Leave a chat room
      socket.on("leave_chat", ({ chatId }: { chatId: string }) => {
        logger.info(`User leaving chat room ${chatId}`);
        socket.leave(chatId);
      });

      // Handle messages
      socket.on("send_message", (message: any) => {
        logger.info(`Message sent in room ${message.chatId}`);
        socket.to(message.chatId).emit("receive_message", message);
        socket.emit("message_sent", { success: true });
      });

      // Handle typing indicators
      socket.on(
        "typing",
        ({ chatId, userId }: { chatId: string; userId: string }) => {
          socket.to(chatId).emit("user_typing", { chatId, userId });
        }
      );

      socket.on(
        "stop_typing",
        ({ chatId, userId }: { chatId: string; userId: string }) => {
          socket.to(chatId).emit("user_stop_typing", { chatId, userId });
        }
      );

      // Handle disconnection
      socket.on("disconnect", () => {
        logger.info(`Chat socket disconnected: ${socket.id}`);
      });
    });
  }
}
