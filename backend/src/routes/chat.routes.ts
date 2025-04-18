import express, { Response } from "express";
import { logger } from "../config/winston";
import auth from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { RequestWithUser } from "../typing.d";
const router = express.Router();

const prisma = new PrismaClient();

// Add a centralized error handler for database operations
const handleDatabaseError = (error: any, res: Response, operation: string) => {
  // Check if this is a database connection error
  if (error.message && error.message.includes("Can't reach database server")) {
    logger.error(`Database connection error during ${operation}:`, error);
    return res.status(503).json({
      message: "Database service unavailable",
      error: "Unable to connect to database. Please try again later.",
    });
  }

  // Handle other database errors
  logger.error(`Error during ${operation}:`, error);
  return res.status(500).json({
    message: `Failed to ${operation}`,
    error: "A database error occurred. Please try again later.",
  });
};

// Search for users (keyword search)
router.get(
  "/search/user",
  auth,
  async (req: RequestWithUser, res: Response) => {
    try {
      const { keyword } = req.query;

      // first get all the follow user from relationship table join it with users table
      const followUsers = await prisma.relationships.findMany({
        where: {
          follower_id: req.user?.id,
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
      const followingUserIds = followUsers.map(
        (user: any) => user.users_relationships_follow_idTousers.id
      );

      // Search for users with name like keyword
      const users = await prisma.users.findMany({
        where: {
          AND: [
            {
              id: {
                not: req.user?.id,
              },
            },
            {
              OR: [
                {
                  name: {
                    contains: keyword as string,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: keyword as string,
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
      const formattedUsers = users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.img,
        isFollowing: followingUserIds.includes(user.id),
      }));

      return res.status(200).json(formattedUsers);
    } catch (error) {
      return handleDatabaseError(error, res, "search users");
    }
  }
);

// Create or get an existing chat between two users
router.post("/create", auth, async (req: RequestWithUser, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Sender and receiver are required" });
    }

    // Check if chat already exists
    const existingChat = await prisma.chats.findFirst({
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
    const newChat = await prisma.chats.create({
      data: {
        user1_id: senderId,
        user2_id: parseInt(receiverId),
        created_at: new Date(),
      },
    });

    return res.status(201).json(newChat);
  } catch (error) {
    return handleDatabaseError(error, res, "create chat");
  }
});

// Get chat history
router.get(
  "/messages/:chatId",
  auth,
  async (req: RequestWithUser, res: Response) => {
    try {
      const { chatId } = req.params;
      const userId = req.user?.id;

      // Validate chat access
      const chat = await prisma.chats.findUnique({
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
      const messages = await prisma.messages.findMany({
        where: { chat_id: parseInt(chatId) },
        orderBy: { created_at: "asc" },
      });

      // Format messages to match frontend expectation
      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id,
        chatId: chatId,
        senderId: String(msg.sender_id),
        text: msg.message,
        timestamp: msg.created_at.toISOString(),
      }));

      return res.status(200).json(formattedMessages);
    } catch (error) {
      return handleDatabaseError(error, res, "fetch messages");
    }
  }
);

// Get user's active chats
router.get("/active", auth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.id;

    // Find all chats where user is participant
    const chats = await prisma.chats.findMany({
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
    const formattedChats = chats.map((chat: any) => {
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
  } catch (error) {
    return handleDatabaseError(error, res, "fetch active chats");
  }
});

export default router;
