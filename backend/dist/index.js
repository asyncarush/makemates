"use strict";
/**
 * @fileoverview Main application entry point.
 * Initializes Express server with middleware and routes.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationManager = exports.io = exports.redisClient = exports.server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const winston_1 = require("./config/winston");
const server_config_1 = require("./config/server.config");
const socket_service_1 = require("./services/socket.service");
const notification_service_1 = require("./services/notification.service");
// Route definitions
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
dotenv_1.default.config();
// Initialize server configuration
const serverConfig = new server_config_1.ServerConfig();
const app = serverConfig.getApp();
//   Create HTTP server
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.IO service
const socketService = new socket_service_1.SocketService(server);
const io = socketService.getIO();
exports.io = io;
const redisClient = socketService.getRedisClient();
exports.redisClient = redisClient;
const notificationManager = new notification_service_1.NotificationManger(io);
exports.notificationManager = notificationManager;
// Middleware
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "https://makemates.asyncarush.com/",
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// Register routes
app.use("/user", user_routes_1.default);
app.use("/posts", post_routes_1.default);
app.use("/search", search_routes_1.default);
app.use("/upload", upload_routes_1.default);
app.use("/chat", chat_routes_1.default);
app.use("/api/ai", ai_routes_1.default);
const PORT = parseInt(process.env.PORT || "2000", 10);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            server.listen(PORT, () => {
                winston_1.logger.info(`Server listening on ${PORT}`);
                console.log(`Socket.IO server running at http://localhost:${PORT}`);
            });
        }
        catch (err) {
            winston_1.logger.error(err);
        }
    });
}
startServer();
