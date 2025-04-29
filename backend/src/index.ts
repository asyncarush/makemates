/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */

import dotenv from "dotenv";
import http from "http";
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

// Register routes
app.use("/user", User);
app.use("/posts", Post);
app.use("/search", Search);
app.use("/", upload);
app.use("/chat", chat);

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
