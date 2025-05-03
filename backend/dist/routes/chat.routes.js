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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const winston_1 = require("../config/winston");
const auth_1 = __importDefault(require("../middleware/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Add a centralized error handler for database operations
const handleDatabaseError = (error, res, operation) => {
    // Check if this is a database connection error
    if (error.message && error.message.includes("Can't reach database server")) {
        winston_1.logger.error(`Database connection error during ${operation}:`, error);
        return res.status(503).json({
            message: "Database service unavailable",
            error: "Unable to connect to database. Please try again later.",
        });
    }
    // Handle other database errors
    winston_1.logger.error(`Error during ${operation}:`, error);
    return res.status(500).json({
        message: `Failed to ${operation}`,
        error: "A database error occurred. Please try again later.",
    });
};
// Search for users (keyword search)
router.get("/search/user", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { keyword } = req.query;
        // first get all the follow user from relationship table join it with users table
        const followUsers = yield prisma.relationships.findMany({
            where: {
                follower_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            },
            include: {
                users_relationships_follow_idTousers: {
                    select: {
                        id: true,
                        name: true,
                        img: true,
                        email: true,
                    },
                },
            },
        });
        // Extract following user ids
        const followingUserIds = followUsers.map((user) => user.users_relationships_follow_idTousers.id);
        // Search for users with name like keyword
        const users = yield prisma.users.findMany({
            where: {
                AND: [
                    {
                        id: {
                            not: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                        },
                    },
                    {
                        OR: [
                            {
                                name: {
                                    contains: keyword,
                                    mode: "insensitive",
                                },
                            },
                            {
                                email: {
                                    contains: keyword,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                img: true,
                email: true,
            },
        });
        // Format users to include following status
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            profilePic: user.img,
            isFollowing: followingUserIds.includes(user.id),
        }));
        return res.status(200).json(formattedUsers);
    }
    catch (error) {
        return handleDatabaseError(error, res, "search users");
    }
}));
// Create or get an existing chat between two users
router.post("/create", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { receiverId } = req.body;
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!senderId || !receiverId) {
            return res
                .status(400)
                .json({ message: "Sender and receiver are required" });
        }
        // Check if chat already exists
        const existingChat = yield prisma.chats.findFirst({
            where: {
                OR: [
                    {
                        user1_id: senderId,
                        user2_id: parseInt(receiverId),
                    },
                    {
                        user1_id: parseInt(receiverId),
                        user2_id: senderId,
                    },
                ],
            },
        });
        if (existingChat) {
            return res.status(200).json(existingChat);
        }
        // Create new chat
        const newChat = yield prisma.chats.create({
            data: {
                user1_id: senderId,
                user2_id: parseInt(receiverId),
                created_at: new Date(),
            },
        });
        return res.status(201).json(newChat);
    }
    catch (error) {
        return handleDatabaseError(error, res, "create chat");
    }
}));
// Get chat history
router.get("/messages/:chatId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { chatId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate chat access
        const chat = yield prisma.chats.findUnique({
            where: { id: parseInt(chatId) },
        });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        // Ensure user is part of this chat
        if (chat.user1_id !== userId && chat.user2_id !== userId) {
            return res
                .status(403)
                .json({ message: "Not authorized to access this chat" });
        }
        // Get messages
        const messages = yield prisma.messages.findMany({
            where: { chat_id: parseInt(chatId) },
            orderBy: { created_at: "asc" },
        });
        // Format messages to match frontend expectation
        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            chatId: chatId,
            senderId: String(msg.sender_id),
            text: msg.message,
            timestamp: msg.created_at.toISOString(),
        }));
        return res.status(200).json(formattedMessages);
    }
    catch (error) {
        return handleDatabaseError(error, res, "fetch messages");
    }
}));
// Get user's active chats
router.get("/active", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Find all chats where user is participant
        const chats = yield prisma.chats.findMany({
            where: {
                OR: [{ user1_id: userId }, { user2_id: userId }],
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        img: true,
                    },
                },
                user2: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        img: true,
                    },
                },
                // Get most recent message for preview
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1,
                },
            },
        });
        // Format chats to include other user's info
        const formattedChats = chats.map((chat) => {
            // Determine which user is the other participant
            const otherUser = chat.user1_id === userId ? chat.user2 : chat.user1;
            return {
                id: chat.id,
                user: {
                    id: otherUser.id,
                    name: otherUser.name,
                    email: otherUser.email,
                    profilePic: otherUser.img,
                },
                lastMessage: chat.messages[0] || null,
                created_at: chat.created_at,
            };
        });
        return res.status(200).json(formattedChats);
    }
    catch (error) {
        return handleDatabaseError(error, res, "fetch active chats");
    }
}));
exports.default = router;
