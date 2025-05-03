"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const client_1 = require("@prisma/client");
const winston_1 = require("../config/winston");
const video_chat_service_1 = require("./video-chat.service");
class SocketService {
    constructor(server) {
        this.cleanupInterval = null;
        this.io = new socket_io_1.Server(server, {
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
        this.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });
        this.prisma = new client_1.PrismaClient();
        this.initializeRedis();
        this.setupSocketHandlers();
        this.startCleanupInterval();
        // Initialize video chat service
        this.videoChatService = new video_chat_service_1.VideoChatService(this.io);
    }
    startCleanupInterval() {
        // Run cleanup every 30 seconds
        this.cleanupInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.cleanupStaleConnections();
            }
            catch (error) {
                winston_1.logger.error("Error in cleanup interval:", error);
            }
        }), 30000);
    }
    cleanupStaleConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const socketKeys = yield this.redisClient.keys("socket:*:user");
                for (const socketKey of socketKeys) {
                    const socketId = socketKey.split(":")[1];
                    const userId = yield this.redisClient.get(socketKey);
                    // Check if socket is still connected
                    const socket = this.io.sockets.sockets.get(socketId);
                    if (!socket && userId) {
                        // Socket is no longer connected, clean up Redis
                        winston_1.logger.info(`Cleaning up stale connection for user ${userId}`);
                        yield this.redisClient.del(socketKey);
                        yield this.redisClient.set(`user:${userId}:status`, "offline");
                        this.io.emit("user:offline", { userId: userId.toString() });
                    }
                }
            }
            catch (error) {
                winston_1.logger.error("Error cleaning up stale connections:", error);
            }
        });
    }
    initializeRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisClient.connect();
                winston_1.logger.info("Redis client connected");
                // Clear all existing online statuses on server start
                const userKeys = yield this.redisClient.keys("user:*:status");
                for (const key of userKeys) {
                    yield this.redisClient.del(key);
                }
                const socketKeys = yield this.redisClient.keys("socket:*:user");
                for (const key of socketKeys) {
                    yield this.redisClient.del(key);
                }
            }
            catch (error) {
                winston_1.logger.error("Redis connection error:", error);
            }
            this.redisClient.on("error", (err) => {
                winston_1.logger.error("Redis client error:", err);
            });
        });
    }
    setupSocketHandlers() {
        this.io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            winston_1.logger.info(`Socket connection established: ${socket.id}`);
            // Send current online users list to newly connected client
            const onlineUsers = yield this.getOnlineUsers();
            socket.emit("users:online", { users: onlineUsers });
            socket.emit("connection_ack", {
                status: "connected",
                socketId: socket.id,
            });
            this.handleUserStatus(socket);
            this.handleChatEvents(socket);
            this.handleDisconnect(socket);
        }));
    }
    handleUserStatus(socket) {
        socket.on("userOnline", (_a) => __awaiter(this, [_a], void 0, function* ({ userId }) {
            try {
                winston_1.logger.info(`User ${userId} setting online status`);
                const userIdStr = userId.toString();
                // Check if user already has an active socket
                const existingSocketKeys = yield this.redisClient.keys(`socket:*:user`);
                for (const key of existingSocketKeys) {
                    const existingUserId = yield this.redisClient.get(key);
                    if (existingUserId === userIdStr) {
                        const oldSocketId = key.split(":")[1];
                        // Remove old socket mapping
                        yield this.redisClient.del(key);
                        winston_1.logger.info(`Removed old socket mapping for user ${userIdStr}`);
                    }
                }
                // Set new socket mapping
                yield this.redisClient.set(`user:${userIdStr}:status`, "online");
                yield this.redisClient.set(`socket:${socket.id}:user`, userIdStr);
                const onlineUsers = yield this.getOnlineUsers();
                winston_1.logger.info(`Broadcasting online users:`, onlineUsers);
                this.io.emit("users:online", { users: onlineUsers });
                this.io.emit("user:online", { userId: userIdStr });
                socket.emit("userOnline:ack", { status: "success" });
            }
            catch (error) {
                winston_1.logger.error("Redis error when setting user online:", error);
                socket.emit("userOnline:ack", {
                    status: "error",
                    message: "Failed to set online status",
                });
            }
        }));
        socket.on("user:offline", (_a) => __awaiter(this, [_a], void 0, function* ({ userId }) {
            try {
                winston_1.logger.info(`User ${userId} setting offline status`);
                const userIdStr = userId.toString();
                yield this.redisClient.set(`user:${userIdStr}:status`, "offline");
                yield this.redisClient.del(`socket:${socket.id}:user`);
                this.io.emit("user:offline", { userId: userIdStr });
                socket.emit("user:offline:ack", { status: "success" });
            }
            catch (error) {
                winston_1.logger.error("Redis error when setting user offline:", error);
                socket.emit("user:offline:ack", {
                    status: "error",
                    message: "Failed to set offline status",
                });
            }
        }));
    }
    getOnlineUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = yield this.redisClient.keys("user:*:status");
                const onlineUsers = [];
                for (const key of keys) {
                    const status = yield this.redisClient.get(key);
                    if (status === "online") {
                        // Extract user ID from key (format: user:userId:status)
                        const userId = key.split(":")[1];
                        onlineUsers.push(userId.toString());
                    }
                }
                winston_1.logger.info(`Found ${onlineUsers.length} online users:`, onlineUsers);
                return onlineUsers;
            }
            catch (error) {
                winston_1.logger.error("Error getting online users:", error);
                return [];
            }
        });
    }
    handleChatEvents(socket) {
        socket.on("join_chat", ({ chatId }) => {
            socket.join(chatId);
            winston_1.logger.info(`Socket ${socket.id} joined chat room: ${chatId}`);
        });
        socket.on("leave_chat", ({ chatId }) => {
            socket.leave(chatId);
            winston_1.logger.info(`Socket ${socket.id} left chat room: ${chatId}`);
        });
        socket.on("send_message", (messageData) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { chatId, senderId, text } = messageData;
                const savedMessage = yield this.prisma.messages.create({
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
            }
            catch (error) {
                winston_1.logger.error("Error sending message:", error);
                socket.emit("message_error", { error: "Failed to send message" });
            }
        }));
        socket.on("typing", ({ chatId, userId }) => {
            socket.to(chatId).emit("user_typing", { userId, chatId });
        });
        socket.on("stop_typing", ({ chatId, userId }) => {
            socket.to(chatId).emit("user_stop_typing", { userId, chatId });
        });
    }
    handleDisconnect(socket) {
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = yield this.redisClient.get(`socket:${socket.id}:user`);
                if (userId) {
                    winston_1.logger.info(`User ${userId} disconnected`);
                    const userIdStr = userId.toString();
                    yield this.redisClient.set(`user:${userIdStr}:status`, "offline");
                    yield this.redisClient.del(`socket:${socket.id}:user`);
                    // Broadcast to all remaining clients
                    this.io.emit("user:offline", { userId: userIdStr });
                }
            }
            catch (error) {
                winston_1.logger.error("Error handling disconnect:", error);
            }
        }));
    }
    getIO() {
        return this.io;
    }
    getRedisClient() {
        return this.redisClient;
    }
}
exports.SocketService = SocketService;
