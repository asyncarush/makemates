import { Server } from "socket.io";
import { logger } from "../config/winston";

export class VideoChatService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupVideoChatHandlers();
  }

  private setupVideoChatHandlers() {
    
    this.io.of("/video-chat").on("connection", (socket) => {
      logger.info(`Video chat socket connected: ${socket.id}`);

      // Handle video call request
      socket.on("video-call-request", ({ roomId, callerId, callerName }) => {
        logger.info(
          `Video call request from ${callerName} (${callerId}) to room ${roomId}`
        );
        // Emit to all users in the room except the sender
        socket.to(roomId).emit("incoming-video-call", {
          roomId,
          callerId,
          callerName,
        });
      });

      // Handle video call response
      socket.on("video-call-response", ({ roomId, receiverId, accepted }) => {
        if (accepted) {
          logger.info(`Video call accepted by ${receiverId} in room ${roomId}`);
          socket.to(roomId).emit("video-call-accepted", { roomId, receiverId });
        } else {
          logger.info(`Video call rejected by ${receiverId} in room ${roomId}`);
          socket.to(roomId).emit("video-call-rejected", { roomId, receiverId });
        }
      });

      // Join a video room
      socket.on("join-video-room", ({ roomId, userId }) => {
        logger.info(`User ${userId} joining video room ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", { userId });
      });

      // Leave a video room
      socket.on("leave-video-room", ({ roomId, userId }) => {
        logger.info(`User ${userId} leaving video room ${roomId}`);
        socket.leave(roomId);
        socket.to(roomId).emit("user-left", { userId });
      });

      // Handle WebRTC signaling
      socket.on("offer", ({ roomId, offer, userId }) => {
        logger.info(`Received offer from ${userId} in room ${roomId}`);
        socket.to(roomId).emit("offer", { offer, userId });
      });

      socket.on("answer", ({ roomId, answer, userId }) => {
        logger.info(`Received answer from ${userId} in room ${roomId}`);
        socket.to(roomId).emit("answer", { answer, userId });
      });

      socket.on("ice-candidate", ({ roomId, candidate, userId }) => {
        logger.info(`Received ICE candidate from ${userId} in room ${roomId}`);
        socket.to(roomId).emit("ice-candidate", { candidate, userId });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        logger.info(`Video chat socket disconnected: ${socket.id}`);
      });
    });
  }
}
