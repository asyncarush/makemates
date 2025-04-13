/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */

// Core dependencies
import express, { Application } from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

// Security middleware
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Utility middleware
import compression from "compression";
import bodyParser from "body-parser";
import morgan from "morgan";

// Logging configuration
import { logger } from "./config/winston";

// Route definitions
import User from "./routes/user.routes";
import Post from "./routes/post.routes";
import Search from "./routes/search.routes";
import upload from "./routes/upload.routes";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// Enable debug mode for Socket.IO if in development
if (process.env.NODE_ENV === "development") {
  console.log("Socket.IO debug mode enabled");
}

// Setup Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("Redis client connected");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
})();

// Handle Redis errors
redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

// Setup CORS for Express
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use("/user", User);
app.use("/posts", Post);
app.use("/search", Search);
app.use("/", upload);

app.get("/health", (req, res) => {
  res.status(200).send("Chill , everything is working fine");
});

// Socket.IO event handlers
io.on("connection", (socket: any) => {
  console.log("Socket connection established:", socket.id);

  // Send immediate acknowledgment to the client
  socket.emit("connection_ack", { status: "connected", socketId: socket.id });

  // Handle errors at the socket level
  socket.on("error", (error: any) => {
    console.error(`Socket ${socket.id} error:`, error);
  });

  socket.on("userOnline", async ({ userId }: { userId: string }) => {
    console.log(`User ${userId} is now online (socket: ${socket.id})`);

    try {
      await redisClient.set(`user:${userId}:status`, "online");
      // Store user-socket mapping
      await redisClient.set(`socket:${socket.id}:user`, userId);
      // Inform other connected clients
      socket.broadcast.emit("user:status", { userId, status: "online" });
      // Send acknowledgment to client
      socket.emit("userOnline:ack", { status: "success" });
    } catch (error) {
      console.error("Redis error when setting user online:", error);
      socket.emit("userOnline:ack", {
        status: "error",
        message: "Failed to set online status",
      });
    }
  });

  socket.on("user-offline", async ({ userId }: { userId: string }) => {
    console.log(`User ${userId} is now offline (socket: ${socket.id})`);
    try {
      await redisClient.set(`user:${userId}:status`, "offline");
      // Remove socket mapping
      await redisClient.del(`socket:${socket.id}:user`);
      // Inform other connected clients
      socket.broadcast.emit("user:status", { userId, status: "offline" });
      // Send acknowledgment to client
      socket.emit("user-offline:ack", { status: "success" });
    } catch (error) {
      console.error("Redis error when setting user offline:", error);
      socket.emit("user-offline:ack", {
        status: "error",
        message: "Failed to set offline status",
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`Socket disconnected: ${socket.id}`);
    try {
      // Check if there's a user associated with this socket
      const userId = await redisClient.get(`socket:${socket.id}:user`);
      if (userId) {
        console.log(`User ${userId} went offline due to socket disconnect`);
        await redisClient.set(`user:${userId}:status`, "offline");
        await redisClient.del(`socket:${socket.id}:user`);
        // Notify other clients
        socket.broadcast.emit("user:status", { userId, status: "offline" });
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

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

export { server, redisClient, io };
