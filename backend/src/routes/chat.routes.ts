import { Router, Response } from "express";
import auth from "../middleware/auth";
import { RequestWithUser } from "../typing";
import { logger } from "../config/winston";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get(
  "/search/user",
  auth,
  async (req: RequestWithUser, res: Response) => {
    const { keyword } = req.query;

    // first get all the follow user from relationship table jpin it with users table
    const followUsers = await prisma.relationships.findMany({
      where: {
        follower_id: req.user?.id,
      },
      select: {
        follow_id: true,
      },
    });

    // get all the users from users table
    const users = await prisma.users.findMany({
      where: {
        id: { in: followUsers.map((user) => user.follow_id) },
        name: { contains: keyword as string },
      },
    });

    return res.status(200).json(users);
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
    logger.error("Error creating chat:", error);
    return res.status(500).json({ message: "Failed to create chat" });
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
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        chatId: chatId,
        senderId: String(msg.sender_id),
        text: msg.message,
        timestamp: msg.created_at.toISOString(),
      }));

      return res.status(200).json(formattedMessages);
    } catch (error) {
      logger.error("Error fetching messages:", error);
      return res.status(500).json({ message: "Failed to fetch messages" });
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
  } catch (error) {
    logger.error("Error fetching active chats:", error);
    return res.status(500).json({ message: "Failed to fetch active chats" });
  }
});

export default router;
