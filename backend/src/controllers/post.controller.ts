/**
 * @fileoverview Controller for handling post-related operations including
 * creation, modification, deletion, and interaction with posts.
 */

// Core Express types
import { Request, Response } from "express";

// Database client
import { Prisma, PrismaClient } from "@prisma/client";

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

interface Posts {
  userid: number;
  username: string;
  userprofileimage: string;
  postid: number;
  content: string;
  postdate: string;
  media_urls: string[];
  cu_like_status: number;
  totallikes: number;
  totalcomments: number;
}

/**
 * Extracts hashtags from a given text.
 * Hashtags are words starting with # symbol.
 *
 * @param {string} text - The text to extract hashtags from
 * @returns {string[]} Array of unique hashtag names (without # symbol)
 */
const extractHashtags = (text: string): string[] => {
  if (!text) return [];

  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);

  if (!matches) return [];

  // Remove # symbol and convert to lowercase, then remove duplicates
  const hashtags = matches.map(tag => tag.slice(1).toLowerCase());
  return Array.from(new Set(hashtags));
};

/**
 * Saves hashtags for a post and creates associations.
 *
 * @param {number} postId - The ID of the post
 * @param {string[]} hashtags - Array of hashtag names
 */
const saveHashtagsForPost = async (postId: number, hashtags: string[]) => {
  if (!hashtags || hashtags.length === 0) return;

  for (const tagName of hashtags) {
    try {
      // Find or create the hashtag
      let hashtag = await prisma.hashtags.findUnique({
        where: { name: tagName }
      });

      if (!hashtag) {
        hashtag = await prisma.hashtags.create({
          data: { name: tagName, post_count: 1 }
        });
      } else {
        // Increment post count
        await prisma.hashtags.update({
          where: { id: hashtag.id },
          data: { post_count: { increment: 1 } }
        });
      }

      // Create association in post_hashtags (ignore if already exists)
      await prisma.post_hashtags.create({
        data: {
          post_id: postId,
          hashtag_id: hashtag.id
        }
      }).catch(() => {
        // Ignore duplicate key errors
      });
    } catch (err) {
      logger.error(`Error saving hashtag ${tagName}:`, err);
    }
  }
};
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

    // Extract and save hashtags from description
    const hashtags = extractHashtags(desc);
    await saveHashtagsForPost(post.id, hashtags);

    const urls = JSON.parse(imgUrls);

    if (imgUrls && Array.isArray(urls)) {
      await Promise.all(
        urls
          .map((media: any) => {
            // Ensure we're using the URL string, not the entire media object
            const mediaUrl = typeof media === "string" ? media : media?.url;
            if (!mediaUrl) {
              console.error("Invalid media URL:", media);
              return null;
            }
            return prisma.post_media.create({
              data: {
                post_id: post.id,
                media_url: mediaUrl,
                user_id: req.user?.id || -1,
              },
            });
          })
          .filter(Boolean) // Filter out any null values from invalid media
      );
    }

    const sender = await prisma.users.findUnique({
      where: {
        id: req.user?.id || -1,
      },
      select: {
        name: true,
      },
    });
    console.log("SenderName ", sender);

    // Generate dynamic notification message based on post content
    let notificationMessage = `${sender?.name || 'Someone'}`;

    // Check if there are media files
    const mediaCount = urls && Array.isArray(urls) ? urls.length : 0;

    if (mediaCount > 0) {
      // Determine if it's photos or videos based on URL extension
      const hasVideo = urls.some((media: any) => {
        const url = typeof media === 'string' ? media : media?.url;
        return url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm'));
      });

      if (hasVideo) {
        notificationMessage += mediaCount > 1
          ? ` posted ${mediaCount} videos`
          : ' posted a video';
      } else {
        notificationMessage += mediaCount > 1
          ? ` shared ${mediaCount} photos`
          : ' shared a photo';
      }
    } else {
      notificationMessage += ' posted an update';
    }

    // Add hashtag information if present
    if (hashtags.length > 0) {
      const firstTwoHashtags = hashtags.slice(0, 2).map(tag => `#${tag}`).join(' ');
      notificationMessage += ` about ${firstTwoHashtags}`;
    }

    // Add a snippet of the description if available and no hashtags
    if (hashtags.length === 0 && desc && desc.trim().length > 0) {
      const descSnippet = desc.length > 30 ? desc.substring(0, 30) + '...' : desc;
      notificationMessage += `: "${descSnippet}"`;
    }

    // will be used to send notification to the followers
    const notificationData = {
      user_sender_id: req.user?.id || -1,
      type: "post",
      resource_id: post.id,
      message: notificationMessage,
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
    // Get old hashtags before update
    const oldPostHashtags = await prisma.post_hashtags.findMany({
      where: { post_id: parsedPostId },
      include: { hashtags: true }
    });

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

    // Remove old hashtag associations and decrement counts
    for (const postHashtag of oldPostHashtags) {
      await prisma.post_hashtags.delete({
        where: {
          post_id_hashtag_id: {
            post_id: parsedPostId,
            hashtag_id: postHashtag.hashtag_id
          }
        }
      });

      await prisma.hashtags.update({
        where: { id: postHashtag.hashtag_id },
        data: { post_count: { decrement: 1 } }
      });
    }

    // Extract and save new hashtags
    const newHashtags = extractHashtags(desc);
    await saveHashtagsForPost(parsedPostId, newHashtags);

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

export const getUserPosts = async (req: RequestWithUser, res: Response) => {
  const { userId } = req.params;
  const currentUserId = parseInt(userId, 10);

  try {
    // 1️⃣ Fetch all users that current user follows
    const relationships = await prisma.relationships.findMany({
      where: { follower_id: currentUserId },
      select: { follow_id: true },
    });

    // 2️⃣ Collect followed user IDs + include self
    const followedUserIds = relationships.map((r) => r.follow_id);
    const userIdsToFetch = [...followedUserIds, currentUserId];

    if (userIdsToFetch.length === 0) {
      return res.status(200).json([]); // nothing to fetch
    }

    // 3️⃣ Build SQL query (clean & safe)
    const query = `
      WITH post_likes AS (
        SELECT l.post_id, COUNT(*) AS total_likes 
        FROM likes l 
        GROUP BY l.post_id
      ),
      post_comments AS (
        SELECT c.post_id, COUNT(*) AS total_comments 
        FROM comments c 
        GROUP BY c.post_id
      ),
      user_like_status AS (
        SELECT post_id, 1 AS liked
        FROM likes
        WHERE user_id = $1
      ),
      latest_comments AS (
        SELECT 
          c.id, 
          c.post_id, 
          c.user_id, 
          c."desc", 
          c.datetime, 
          u.name AS commenter_name,
          ROW_NUMBER() OVER (PARTITION BY c.post_id ORDER BY c.datetime DESC) rn
        FROM comments c
        JOIN users u ON u.id = c.user_id
      ),
      post_images AS (
        SELECT pm.post_id, ARRAY_AGG(pm.media_url) AS images
        FROM post_media pm
        GROUP BY pm.post_id
      )
      SELECT 
        p.id AS postid,
        p."desc" AS content,
        p.tags,
        p.date AS postdate,
        p.user_id AS userid,
        u.name AS username,
        u.img AS userprofileimage,
        COALESCE(pl.total_likes, 0) AS totallikes,
        COALESCE(pc.total_comments, 0) AS totalcomments,
        COALESCE(uls.liked, 0) AS cu_like_status,
        COALESCE(pi.images, '{}') AS media_urls,
        ARRAY_AGG(
          CASE 
            WHEN lc.rn <= 3 THEN 
              JSON_BUILD_OBJECT(
                'id', lc.id,
                'desc', lc."desc",
                'datetime', lc.datetime,
                'commenter_name', lc.commenter_name
              )
            ELSE NULL
          END
        ) FILTER (WHERE lc.rn <= 3) AS latest_comments
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      LEFT JOIN post_comments pc ON pc.post_id = p.id
      LEFT JOIN latest_comments lc ON lc.post_id = p.id
      LEFT JOIN post_images pi ON pi.post_id = p.id
      LEFT JOIN user_like_status uls ON uls.post_id = p.id
      WHERE p.user_id = ANY($2::int[])
      GROUP BY p.id, u.id, u.name, u.img, pl.total_likes, pc.total_comments, pi.images, uls.liked
      ORDER BY p.date DESC;
    `;

    // 4️⃣ Execute safely — pass params individually
    const rows = await prisma.$queryRawUnsafe<Posts[]>(
      query,
      currentUserId,
      userIdsToFetch
    );

    // Convert all BigInt fields to numbers or strings
    const sanitizedRows = JSON.parse(
      JSON.stringify(rows, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    // 5️⃣ Return data
    return res.status(200).json(sanitizedRows);
  } catch (err) {
    logger.error("Error fetching user posts: ", err);
    return res.status(500).send("Unable to fetch user posts");
  }
};

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
      where: { post_id: parseInt(postId, 10), parent_comment_id: null },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profileimages: true,
            img: true,
          },
        },
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
  let { postId, mediaUrls } = req.body;
  mediaUrls = JSON.parse(mediaUrls);

  const deleteApiCalls = [];

  for (let media of mediaUrls) {
    const fileName = media.split("posts/")[1];
    console.log("Filename:", fileName);
    const deleteFromdb = prisma.post_media.deleteMany({
      where: {
        post_id: parseInt(postId, 10),
        media_url: media,
        user_id: req.user?.id || -1,
      },
    });

    const deleteFromMinIO = deleteFile(fileName);

    deleteApiCalls.push(deleteFromdb);
    deleteApiCalls.push(deleteFromMinIO);
  }

  try {
    const response = await Promise.all(deleteApiCalls);
    console.log("delete response : ", response);
    return res.status(200).send(true);
  } catch (error) {
    console.error(error);
    return res.status(400).send(error);
  }
};

export const postNewReply = async (req: RequestWithUser, res: Response) => {
  const { parentCommentId, desc, postId } = req.body;
  // save reply to comment

  try {
    await prisma.comments.create({
      data: {
        post_id: postId,
        user_id: req.user?.id || -1,
        desc: desc,
        parent_comment_id: parseInt(parentCommentId),
      },
    });
    return res.status(200).send("success");
  } catch (err) {
    return res.status(400).send(err);
  }
};

export const getCommentReplies = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const replies = await prisma.comments.findMany({
      where: { parent_comment_id: parseInt(commentId) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profileimages: true,
            img: true,
          },
        },
      },
    });
    return res.status(200).send(replies);
  } catch (error) {
    return res.status(400).send(error);
  }
};
