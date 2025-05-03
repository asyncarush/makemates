"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const winston_1 = require("../config/winston");
class ChatService {
    constructor(io) {
        this.io = io;
        this.setupChatHandlers();
    }
    setupChatHandlers() {
        this.io.of("/chat").on("connection", (socket) => {
            winston_1.logger.info(`Chat socket connected: ${socket.id}`);
            // Handle video call request
            socket.on("video-call-request", ({ roomId, callerId, callerName, }) => {
                winston_1.logger.info(`Video call request from ${callerName} (${callerId}) to room ${roomId}`);
                socket.to(roomId).emit("incoming-video-call", {
                    roomId,
                    callerId,
                    callerName,
                });
            });
            // Handle video call response
            socket.on("video-call-response", ({ roomId, receiverId, accepted, }) => {
                if (accepted) {
                    winston_1.logger.info(`Video call accepted by ${receiverId} in room ${roomId}`);
                    socket
                        .to(roomId)
                        .emit("video-call-accepted", { roomId, receiverId });
                }
                else {
                    winston_1.logger.info(`Video call rejected by ${receiverId} in room ${roomId}`);
                    socket
                        .to(roomId)
                        .emit("video-call-rejected", { roomId, receiverId });
                }
            });
            // Join a chat room
            socket.on("join_chat", ({ chatId }) => {
                winston_1.logger.info(`User joining chat room ${chatId}`);
                socket.join(chatId);
            });
            // Leave a chat room
            socket.on("leave_chat", ({ chatId }) => {
                winston_1.logger.info(`User leaving chat room ${chatId}`);
                socket.leave(chatId);
            });
            // Handle messages
            socket.on("send_message", (message) => {
                winston_1.logger.info(`Message sent in room ${message.chatId}`);
                socket.to(message.chatId).emit("receive_message", message);
                socket.emit("message_sent", { success: true });
            });
            // Handle typing indicators
            socket.on("typing", ({ chatId, userId }) => {
                socket.to(chatId).emit("user_typing", { chatId, userId });
            });
            socket.on("stop_typing", ({ chatId, userId }) => {
                socket.to(chatId).emit("user_stop_typing", { chatId, userId });
            });
            // Handle disconnection
            socket.on("disconnect", () => {
                winston_1.logger.info(`Chat socket disconnected: ${socket.id}`);
            });
        });
    }
}
exports.ChatService = ChatService;
