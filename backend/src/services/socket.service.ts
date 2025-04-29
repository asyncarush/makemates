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
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:3000", "https://makemates.asyncarush.com/"],
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
    this.startCleanupInterval();

    // Initialize video chat service
    this.videoChatService = new VideoChatService(this.io);
  }

  private startCleanupInterval() {
    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupStaleConnections();
      } catch (error) {
        logger.error("Error in cleanup interval:", error);
      }
    }, 30000);
  }

  private async cleanupStaleConnections() {
    try {
      const socketKeys = await this.redisClient.keys("socket:*:user");

      for (const socketKey of socketKeys) {
        const socketId = socketKey.split(":")[1];
        const userId = await this.redisClient.get(socketKey);

        // Check if socket is still connected
        const socket = this.io.sockets.sockets.get(socketId);
        if (!socket && userId) {
          // Socket is no longer connected, clean up Redis
          logger.info(`Cleaning up stale connection for user ${userId}`);
          await this.redisClient.del(socketKey);
          await this.redisClient.set(`user:${userId}:status`, "offline");
          this.io.emit("user:offline", { userId: userId.toString() });
        }
      }
    } catch (error) {
      logger.error("Error cleaning up stale connections:", error);
    }
  }

  private async initializeRedis() {
    try {
      await this.redisClient.connect();
      logger.info("Redis client connected");

      // Clear all existing online statuses on server start
      const userKeys = await this.redisClient.keys("user:*:status");
      for (const key of userKeys) {
        await this.redisClient.del(key);
      }
      const socketKeys = await this.redisClient.keys("socket:*:user");
      for (const key of socketKeys) {
        await this.redisClient.del(key);
      }
    } catch (error) {
      logger.error("Redis connection error:", error);
    }

    this.redisClient.on("error", (err) => {
      logger.error("Redis client error:", err);
    });
  }

  private setupSocketHandlers() {
    this.io.on("connection", async (socket: any) => {
      logger.info(`Socket connection established: ${socket.id}`);

      // Send current online users list to newly connected client
      const onlineUsers = await this.getOnlineUsers();
      socket.emit("users:online", { users: onlineUsers });

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
        logger.info(`User ${userId} setting online status`);
        const userIdStr = userId.toString();

        // Check if user already has an active socket
        const existingSocketKeys = await this.redisClient.keys(`socket:*:user`);
        for (const key of existingSocketKeys) {
          const existingUserId = await this.redisClient.get(key);
          if (existingUserId === userIdStr) {
            const oldSocketId = key.split(":")[1];
            // Remove old socket mapping
            await this.redisClient.del(key);
            logger.info(`Removed old socket mapping for user ${userIdStr}`);
          }
        }

        // Set new socket mapping
        await this.redisClient.set(`user:${userIdStr}:status`, "online");
        await this.redisClient.set(`socket:${socket.id}:user`, userIdStr);

        const onlineUsers = await this.getOnlineUsers();
        logger.info(`Broadcasting online users:`, onlineUsers);
        this.io.emit("users:online", { users: onlineUsers });
        this.io.emit("user:online", { userId: userIdStr });

        socket.emit("userOnline:ack", { status: "success" });
      } catch (error) {
        logger.error("Redis error when setting user online:", error);
        socket.emit("userOnline:ack", {
          status: "error",
          message: "Failed to set online status",
        });
      }
    });

    socket.on("user:offline", async ({ userId }: { userId: string }) => {
      try {
        logger.info(`User ${userId} setting offline status`);
        const userIdStr = userId.toString();

        await this.redisClient.set(`user:${userIdStr}:status`, "offline");
        await this.redisClient.del(`socket:${socket.id}:user`);

        this.io.emit("user:offline", { userId: userIdStr });
        socket.emit("user:offline:ack", { status: "success" });
      } catch (error) {
        logger.error("Redis error when setting user offline:", error);
        socket.emit("user:offline:ack", {
          status: "error",
          message: "Failed to set offline status",
        });
      }
    });
  }

  private async getOnlineUsers(): Promise<string[]> {
    try {
      const keys = await this.redisClient.keys("user:*:status");
      const onlineUsers: string[] = [];

      for (const key of keys) {
        const status = await this.redisClient.get(key);
        if (status === "online") {
          // Extract user ID from key (format: user:userId:status)
          const userId = key.split(":")[1];
          onlineUsers.push(userId.toString());
        }
      }

      logger.info(`Found ${onlineUsers.length} online users:`, onlineUsers);
      return onlineUsers;
    } catch (error) {
      logger.error("Error getting online users:", error);
      return [];
    }
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
          logger.info(`User ${userId} disconnected`);
          const userIdStr = userId.toString();

          await this.redisClient.set(`user:${userIdStr}:status`, "offline");
          await this.redisClient.del(`socket:${socket.id}:user`);

          // Broadcast to all remaining clients
          this.io.emit("user:offline", { userId: userIdStr });
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
