/**
 * @fileoverview Controller for handling post-related operations including
 * creation, modification, deletion, and interaction with posts.
 */

// Core Express types
import { Request, Response } from "express";

// Database client
import { PrismaClient } from "@prisma/client";

// Custom types and interfaces
import { RequestWithUser } from "../typing";

// Logger
import { logger } from "../config/winston";

import { notificationManager } from "../index";

import { deleteFile } from "../services/minio.service";

const prisma = new PrismaClient();

interface User {
  id: number;
}

// Add Post
/**
 * Creates a new post with the provided description and image URLs.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
export const addPost = async (req: RequestWithUser, res: Response) => {
  const { desc, imgUrls } = req.body;
  try {
    const post = await prisma.posts.create({
      data: {
        user_id: req.user?.id || -1,
        desc,
      },
    });

    const urls = JSON.parse(imgUrls);

    if (imgUrls) {
      await Promise.all(
        urls.map((url: string) =>
          prisma.post_media.create({
            data: {
              post_id: post.id,
              media_url: url,
              user_id: req.user?.id || -1,
            },
          })
        )
      );
    }

    // will be used to send notification to the followers
    const notificationData = {
      user_sender_id: req.user?.id || -1,
      type: "post",
      resource_id: post.id,
      message: "New post uploaded",
      isRead: false,
    };

    console.log("Sending notification to : ", notificationData);

    notificationManager.addNotification("post", notificationData);

    return res.status(200).send("Post uploaded...");
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

export const editPost = async (req: RequestWithUser, res: Response) => {
  const { desc, imgUrls } = req.body;
  const { postId } = req.params;

  console.log("Received postId:", postId);
  console.log("Received imgUrls:", imgUrls);
  console.log("Type of imgUrls:", typeof imgUrls);

  const parsedPostId = parseInt(postId, 10);
  if (isNaN(parsedPostId)) {
    return res.status(400).send("Invalid post ID");
  }

  try {
    // First update the post

    const updatedPost = await prisma.posts.update({
      where: {
        id: parsedPostId,
        user_id: req.user?.id || -1,
      },
      data: {
        desc: desc,
      },
    });

    console.log("Updated post:", updatedPost);

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    // Parse imgUrls if it's a string

    if (!imgUrls) {
      return res.status(200).send("Post Saved...");
    }

    const imageUrlsArray =
      typeof imgUrls === "string" ? JSON.parse(imgUrls) : imgUrls;
    console.log("Processing imageUrlsArray:", imageUrlsArray);

    // Create new media entries
    if (Array.isArray(imageUrlsArray)) {
      for (let imgs of imageUrlsArray) {
        console.log("Creating media entry for:", imgs);
        await prisma.post_media.create({
          data: {
            post_id: parsedPostId,
            media_url: imgs,
            user_id: req.user?.id || -1,
          },
        });
      }
    }

    return res.status(200).send("Post Saved...");
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Get User Posts
/**
 * Retrieves a list of posts for the specified user, including their own posts and posts from users they follow.
 *
 * @param {Request} req - The incoming request.
 * @param {Response} res - The outgoing response.
 */
export const getUserPosts = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // get all the followers list
    const followers = await prisma.relationships.findMany({
      where: { follower_id: parseInt(userId) },
    });

    const followersId = followers.map((item) => item.follow_id);

    // get all posts whoes post's user id are in followersId
    // console.log("Follower Id : ", followersId);
    const posts = await prisma.posts.findMany({
      where: {
        OR: [
          { user_id: { in: followersId } }, // Posts by followed users
          { user_id: parseInt(userId, 10) }, // Your own posts
        ],
      },
      orderBy: { date: "desc" },
      include: {
        post_media: true,
        users: {
          include: {
            profileimages: true,
          },
        },
      },
    });

    // console.log("all posts : ", posts);

    return res.status(200).send(posts);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Like the Post
/**
 * Creates a new like for the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
export const likeThePost = async (req: RequestWithUser, res: Response) => {
  const { postId } = req.body;

  try {
    await prisma.likes.create({
      data: {
        post_id: postId,
        user_id: req.user?.id || -1,
      },
    });

    return res.status(200).send(true);
  } catch (err) {
    if (err instanceof Error) {
      logger.error("Post hasn't been liked...", err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Unlike the Post
/**
 * Deletes the like for the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
export const unLikeThePost = async (req: RequestWithUser, res: Response) => {
  const { postId } = req.body;

  try {
    await prisma.likes.deleteMany({
      where: {
        user_id: req.user?.id || -1,
        post_id: postId,
      },
    });

    return res.status(200).send(true);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Check Post Like Status
/**
 * Checks if the user has liked the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
export const checkPostLikeStatus = async (
  req: RequestWithUser,
  res: Response
) => {
  const { postId } = req.body;

  try {
    const like = await prisma.likes.findFirst({
      where: {
        user_id: req.user?.id || -1,
        post_id: postId,
      },
    });

    return res.status(200).send(!!like);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
      return res.status(500).send(err.message);
    }
    logger.error("An unknown error occurred.");
    return res.status(500).send("An unknown error occurred.");
  }
};

// Post New Comment
/**
 * Creates a new comment for the specified post.
 *
 * @param {RequestWithUser} req - The incoming request with user information.
 * @param {Response} res - The outgoing response.
 */
export const postNewComment = async (req: RequestWithUser, res: Response) => {
  const { postId, desc } = req.body;

  try {
    await prisma.comments.create({
      data: {
        user_id: req.user?.id || -1,
        post_id: postId,
        desc: desc,
      },
    });

    return res.status(200).send("success");
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).send(err.message);
    }
    return res.status(400).send("An unknown error occurred.");
  }
};

// Get Post Comments
/**
 * Retrieves a list of comments for the specified post.
 *
 * @param {Request} req - The incoming request.
 * @param {Response} res - The outgoing response.
 */
export const getPostComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comments.findMany({
      where: { post_id: parseInt(postId, 10) },
      include: {
        users: true,
      },
    });

    return res.status(200).send(comments);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).send(err.message);
    }
    return res.status(400).send("An unknown error occurred.");
  }
};

export const removeThisImage = async (req: RequestWithUser, res: Response) => {
  const { postId, media } = req.body;

  try {
    const deleteFromDB = prisma.post_media.deleteMany({
      where: {
        post_id: parseInt(postId, 10),
        media_url: media,
        user_id: req.user?.id || -1,
      },
    });

    // https://minio-api.asyncarush.com/posts/1745945545469-image_1745945535018.png

    const fileName = media.split("posts/")[1];
    console.log("Filename:", fileName);
    const deleteFromMinIO = deleteFile(fileName);

    const [postMediaDeleteResult, minioDeleteResult] = await Promise.all([
      deleteFromDB,
      deleteFromMinIO,
    ]);

    console.log("DB delete result:", postMediaDeleteResult);
    console.log("MinIO delete result:", minioDeleteResult);

    return res.status(200).send(true);
  } catch (e: any) {
    console.error("Deletion error:", e);
    throw new Error("Failed to delete media");
    return res.status(400).send(e.message);
  }
};
