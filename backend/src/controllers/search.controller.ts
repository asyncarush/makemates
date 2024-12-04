import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../config/winston";
import { RequestWithUser } from "../typing";

const prisma = new PrismaClient();

// Get User Profile
export const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.body.id;
  console.log("looking for user with id : ", userId);

  try {
    const userData = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      // include: {
      //   profileimages: true, // Adjust if the relation is named differently in Prisma schema
      // },
    });

    if (userData) {
      // Fetch user's posts
      const userPosts = await prisma.posts.findMany({
        where: { user_id: parseInt(userId) },
        orderBy: { date: "desc" },
        include: {
          post_media: true,
          users: {
            include: {
              profileimages: true, // Adjust if needed
            },
          },
        },
      });

      return res.status(200).send({ userData, userPosts });
    } else {
      return res.status(204).send("User not Found");
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Check if User is Followed
export const checkFollowed = async (req: RequestWithUser, res: Response) => {
  const { friendId }: any = req.body;

  try {
    const relationship = await prisma.relationships.findFirst({
      where: {
        follower_id: req.user?.id || -1,
        follow_id: friendId,
      },
    });

    if (relationship) {
      return res.status(200).send("USER_FOUND");
    } else {
      return res.status(200).send("USER_NOT_FOUND");
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Search User
export const searchUser = async (req: Request, res: Response) => {
  const { keyword } = req.body;

  console.log("Searching for keyword:", keyword);

  try {
    if (!keyword || keyword.trim() === "") {
      return res.status(200).send([]);
    }

    const users = await prisma.users.findMany({
      where: {
        name: {
          contains: keyword.toLowerCase(),
          mode: "insensitive",
        },
      },
      include: {
        profileimages: true,
      },
      take: 10, // Limit results to 10 users
    });

    console.log("Found users:", users.length);
    return res.status(200).send(users);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).send({ error: "Error searching for users" });
  }
};
