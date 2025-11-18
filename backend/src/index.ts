/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */

import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import express from "express";
import { logger } from "./config/winston";
import { ServerConfig } from "./config/server.config";
import { SocketService } from "./services/socket.service";
import { NotificationManger } from "./services/notification.service";

// Route definitions
import User from "./routes/user.routes";
import Post from "./routes/post.routes";
import Search from "./routes/search.routes";
import upload from "./routes/upload.routes";
import chat from "./routes/chat.routes";
import AIRoute from "./routes/ai.routes";
import Hashtag from "./routes/hashtag.routes";
import TTS from "./routes/tts.routes";

dotenv.config();

// Initialize server configuration
const serverConfig = new ServerConfig();
const app = serverConfig.getApp();

//   Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);
const io = socketService.getIO();
const redisClient = socketService.getRedisClient();
const notificationManager = new NotificationManger(io);

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://makemates.asyncarush.com/",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Register routes
app.use("/user", User);
app.use("/posts", Post);
app.use("/search", Search);
app.use("/upload", upload);
app.use("/chat", chat);
app.use("/api/ai", AIRoute);
app.use("/hashtags", Hashtag);
app.use("/api/tts", TTS);

const PORT: number = parseInt(process.env.PORT || "2000", 10);

async function startServer() {
  try {
    server.listen(PORT, () => {
      logger.info(`Server listening on ${PORT}`);
      console.log(`Socket.IO server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error(err);
  }
}

startServer();

export { server, redisClient, io, notificationManager };
