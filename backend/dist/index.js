"use strict";
/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.redisClient = exports.server = void 0;
// Core dependencies
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const client_1 = require("@prisma/client");
// Security middleware
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Utility middleware
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
// Logging configuration
const winston_1 = require("./config/winston");
// Route definitions
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.IO with the server
const io = new socket_io_1.Server(server, {
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
exports.io = io;
// Enable debug mode for Socket.IO if in development
if (process.env.NODE_ENV === "development") {
  console.log("Socket.IO debug mode enabled");
}
// Setup Redis client
const redisClient = (0, redis_1.createClient)({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
exports.redisClient = redisClient;
// Connect to Redis
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield redisClient.connect();
      console.log("Redis client connected");
    } catch (error) {
      console.error("Redis connection error:", error);
    }
  }))();
// Handle Redis errors
redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});
// Setup CORS for Express
app.use(
  (0, cors_1.default)({
    origin: [
      "http://localhost:3000",
      "https://makemates.vercel.app",
      "http://34.42.91.142:9000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
if (process.env.NODE_ENV === "development") {
  app.use((0, morgan_1.default)("dev"));
}
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
// routes
app.use("/user", user_routes_1.default);
app.use("/posts", post_routes_1.default);
app.use("/search", search_routes_1.default);
app.use("/", upload_routes_1.default);
app.use("/chat", chat_routes_1.default);
app.get("/health", (req, res) => {
  res.status(200).send("Chill , everything is working fine");
});
// Create a single Prisma client instance to be reused
const prisma = new client_1.PrismaClient();
// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("Socket connection established:", socket.id);
  socket.emit("connection_ack", { status: "connected", socketId: socket.id });
  socket.on("connection_ack", (data) => {
    console.log("Connection acknowledged by server:", data);
  });
  // Handle errors at the socket level
  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
  socket.on("userOnline", (_a) =>
    __awaiter(void 0, [_a], void 0, function* ({ userId }) {
      console.log(`User ${userId} is now online (socket: ${socket.id})`);
      try {
        yield redisClient.set(`user:${userId}:status`, "online");
        // Store user-socket mapping
        yield redisClient.set(`socket:${socket.id}:user`, userId);
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
    })
  );
  // Join a chat room
  socket.on("join_chat", ({ chatId }) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  });
  // Leave a chat room
  socket.on("leave_chat", ({ chatId }) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat room: ${chatId}`);
  });
  // Handle new message
  socket.on("send_message", (messageData) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const { chatId, senderId, text } = messageData;
        console.log(`New message in chat ${chatId} from ${senderId}: ${text}`);
        // Store message in database
        const savedMessage = yield prisma.messages.create({
          data: {
            chat_id: parseInt(chatId),
            sender_id: parseInt(senderId),
            message: text,
            created_at: new Date(),
          },
        });
        // Format message for client
        const formattedMessage = {
          id: savedMessage.id,
          chatId: chatId,
          senderId: senderId,
          text: savedMessage.message,
          timestamp: savedMessage.created_at.toISOString(),
        };
        // Broadcast to everyone in the room except sender
        socket.to(chatId).emit("receive_message", formattedMessage);
        // Acknowledge message receipt to sender
        socket.emit("message_sent", {
          id: savedMessage.id,
          status: "delivered",
          timestamp: savedMessage.created_at,
          message: formattedMessage,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    })
  );
  // Typing indicator
  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("user_typing", { userId, chatId });
  });
  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("user_stop_typing", { userId, chatId });
  });
  socket.on("user-offline", (_a) =>
    __awaiter(void 0, [_a], void 0, function* ({ userId }) {
      console.log(`User ${userId} is now offline (socket: ${socket.id})`);
      try {
        yield redisClient.set(`user:${userId}:status`, "offline");
        // Remove socket mapping
        yield redisClient.del(`socket:${socket.id}:user`);
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
    })
  );
  socket.on("disconnect", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      console.log(`Socket disconnected: ${socket.id}`);
      try {
        // Check if there's a user associated with this socket
        const userId = yield redisClient.get(`socket:${socket.id}:user`);
        if (userId) {
          console.log(`User ${userId} went offline due to socket disconnect`);
          yield redisClient.set(`user:${userId}:status`, "offline");
          yield redisClient.del(`socket:${socket.id}:user`);
          // Notify other clients
          socket.broadcast.emit("user:status", { userId, status: "offline" });
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    })
  );
});
const PORT = parseInt(process.env.PORT || "2000", 10);
function startServer() {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      server.listen(PORT, () => {
        winston_1.logger.info(`Server listening on ${PORT}`);
        console.log(`Socket.IO server running at http://localhost:${PORT}`);
      });
    } catch (err) {
      winston_1.logger.error(err);
    }
  });
}
startServer();
