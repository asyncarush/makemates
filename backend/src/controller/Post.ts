import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../config/winston";

const prisma = new PrismaClient();

interface User {
  id: number;
}

interface RequestWithUser extends Request {
  user?: User;
}

// Add Post
export const addPost = async (req: RequestWithUser, res: Response) => {
  const { desc, imgUrls } = req.body;

  console.log("imgUrls : ", imgUrls);

  try {
    const post = await prisma.posts.create({
      data: {
        user_id: req.user?.id || -1,
        desc: desc,
      },
    });

    await prisma.post_media.create({
      data: {
        post_id: post.id,
        media_url: JSON.stringify(imgUrls),
        user_id: req.user?.id || -1,
      },
    });

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

    console.log("all posts : ", posts);

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
