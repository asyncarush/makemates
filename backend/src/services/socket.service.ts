import { Server } from "socket.io";
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import { logger } from "../config/winston";
import { VideoChatService } from "./video-chat.service";

export class SocketService {
  private io: Server;
  private redisClient: ReturnType<typeof createClient>;
  private prisma: PrismaClient;
  private videoChatService: VideoChatService;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "https://makemates.vercel.app",
          "http://34.42.91.142:9000",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
    });

    this.redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.prisma = new PrismaClient();
    this.initializeRedis();
    this.setupSocketHandlers();

    // Initialize video chat service
    this.videoChatService = new VideoChatService(this.io);
  }

  private async initializeRedis() {
    try {
      await this.redisClient.connect();
      logger.info("Redis client connected");
    } catch (error) {
      logger.error("Redis connection error:", error);
    }

    this.redisClient.on("error", (err) => {
      logger.error("Redis client error:", err);
    });
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: any) => {
      logger.info(`Socket connection established: ${socket.id}`);
      socket.emit("connection_ack", {
        status: "connected",
        socketId: socket.id,
      });

      this.handleUserStatus(socket);
      this.handleChatEvents(socket);
      this.handleDisconnect(socket);
    });
  }

  private handleUserStatus(socket: any) {
    socket.on("userOnline", async ({ userId }: { userId: string }) => {
      try {
        await this.redisClient.set(`user:${userId}:status`, "online");
        await this.redisClient.set(`socket:${socket.id}:user`, userId);
        socket.broadcast.emit("user:status", { userId, status: "online" });
        socket.emit("userOnline:ack", { status: "success" });
      } catch (error) {
        logger.error("Redis error when setting user online:", error);
        socket.emit("userOnline:ack", {
          status: "error",
          message: "Failed to set online status",
        });
      }
    });

    socket.on("user-offline", async ({ userId }: { userId: string }) => {
      try {
        await this.redisClient.set(`user:${userId}:status`, "offline");
        await this.redisClient.del(`socket:${socket.id}:user`);
        socket.broadcast.emit("user:status", { userId, status: "offline" });
        socket.emit("user-offline:ack", { status: "success" });
      } catch (error) {
        logger.error("Redis error when setting user offline:", error);
        socket.emit("user-offline:ack", {
          status: "error",
          message: "Failed to set offline status",
        });
      }
    });
  }

  private handleChatEvents(socket: any) {
    socket.on("join_chat", ({ chatId }: { chatId: string }) => {
      socket.join(chatId);
      logger.info(`Socket ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on("leave_chat", ({ chatId }: { chatId: string }) => {
      socket.leave(chatId);
      logger.info(`Socket ${socket.id} left chat room: ${chatId}`);
    });

    socket.on(
      "send_message",
      async (messageData: {
        chatId: string;
        senderId: string;
        text: string;
      }) => {
        try {
          const { chatId, senderId, text } = messageData;
          const savedMessage = await this.prisma.messages.create({
            data: {
              chat_id: parseInt(chatId),
              sender_id: parseInt(senderId),
              message: text,
              created_at: new Date(),
            },
          });

          const formattedMessage = {
            id: savedMessage.id,
            chatId: chatId,
            senderId: senderId,
            text: savedMessage.message,
            timestamp: savedMessage.created_at.toISOString(),
          };

          socket.to(chatId).emit("receive_message", formattedMessage);
          socket.emit("message_sent", {
            id: savedMessage.id,
            status: "delivered",
            timestamp: savedMessage.created_at,
            message: formattedMessage,
          });
        } catch (error) {
          logger.error("Error sending message:", error);
          socket.emit("message_error", { error: "Failed to send message" });
        }
      }
    );

    socket.on(
      "typing",
      ({ chatId, userId }: { chatId: string; userId: string }) => {
        socket.to(chatId).emit("user_typing", { userId, chatId });
      }
    );

    socket.on(
      "stop_typing",
      ({ chatId, userId }: { chatId: string; userId: string }) => {
        socket.to(chatId).emit("user_stop_typing", { userId, chatId });
      }
    );
  }

  private handleDisconnect(socket: any) {
    socket.on("disconnect", async () => {
      try {
        const userId = await this.redisClient.get(`socket:${socket.id}:user`);
        if (userId) {
          await this.redisClient.set(`user:${userId}:status`, "offline");
          await this.redisClient.del(`socket:${socket.id}:user`);
          socket.broadcast.emit("user:status", { userId, status: "offline" });
        }
      } catch (error) {
        logger.error("Error handling disconnect:", error);
      }
    });
  }

  public getIO(): Server {
    return this.io;
  }

  public getRedisClient() {
    return this.redisClient;
  }
}
