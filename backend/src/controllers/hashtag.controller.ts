/**
 * @fileoverview Controller for handling hashtag-related operations including
 * searching hashtags, trending hashtags, and retrieving posts by hashtag.
 */

// Core Express types
import { Request, Response } from "express";

// Database client
import { PrismaClient } from "@prisma/client";

// Custom types and interfaces
import { RequestWithUser } from "../typing";

// Logger
import { logger } from "../config/winston";

const prisma = new PrismaClient();

/**
 * Get all posts associated with a specific hashtag
 *
 * @param {RequestWithUser} req - The incoming request with user information
 * @param {Response} res - The outgoing response
 */
export const getPostsByHashtag = async (
  req: RequestWithUser,
  res: Response
) => {
  const { tagName } = req.params;
  const currentUserId = req.user?.id || -1;

  try {
    // Find the hashtag
    const hashtag = await prisma.hashtags.findUnique({
      where: { name: tagName.toLowerCase() },
    });

    if (!hashtag) {
      return res.status(404).json({ message: "Hashtag not found", posts: [] });
    }

    // Get all posts with this hashtag
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
      post_images AS (
        SELECT pm.post_id, ARRAY_AGG(pm.media_url) AS images
        FROM post_media pm
        GROUP BY pm.post_id
      )
      SELECT
        p.id AS postid,
        p."desc" AS content,
        p.date AS postdate,
        p.user_id AS userid,
        u.name AS username,
        u.img AS userprofileimage,
        COALESCE(pl.total_likes, 0) AS totallikes,
        COALESCE(pc.total_comments, 0) AS totalcomments,
        COALESCE(uls.liked, 0) AS cu_like_status,
        COALESCE(pi.images, '{}') AS media_urls
      FROM posts p
      JOIN users u ON u.id = p.user_id
      JOIN post_hashtags ph ON ph.post_id = p.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      LEFT JOIN post_comments pc ON pc.post_id = p.id
      LEFT JOIN post_images pi ON pi.post_id = p.id
      LEFT JOIN user_like_status uls ON uls.post_id = p.id
      WHERE ph.hashtag_id = $2
      GROUP BY p.id, u.id, u.name, u.img, pl.total_likes, pc.total_comments, pi.images, uls.liked
      ORDER BY p.date DESC;
    `;

    const posts = await prisma.$queryRawUnsafe(
      query,
      currentUserId,
      hashtag.id
    );

    // Convert BigInt to Number
    const sanitizedPosts = JSON.parse(
      JSON.stringify(posts, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.status(200).json({
      hashtag: {
        name: hashtag.name,
        post_count: hashtag.post_count,
      },
      posts: sanitizedPosts,
    });
  } catch (err) {
    logger.error("Error fetching posts by hashtag:", err);
    return res.status(500).send("Unable to fetch posts for this hashtag");
  }
};

/**
 * Search for hashtags by name (autocomplete)
 *
 * @param {Request} req - The incoming request
 * @param {Response} res - The outgoing response
 */
export const searchHashtags = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }

  try {
    const hashtags = await prisma.hashtags.findMany({
      where: {
        name: {
          startsWith: q.toLowerCase(),
        },
      },
      orderBy: {
        post_count: "desc",
      },
      take: 10,
      select: {
        name: true,
        post_count: true,
      },
    });

    return res.status(200).json(hashtags);
  } catch (err) {
    logger.error("Error searching hashtags:", err);
    return res.status(500).send("Unable to search hashtags");
  }
};

/**
 * Get trending hashtags (sorted by post count)
 *
 * @param {Request} req - The incoming request
 * @param {Response} res - The outgoing response
 */
export const getTrendingHashtags = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const trendingHashtags = await prisma.hashtags.findMany({
      where: {
        post_count: {
          gt: 0,
        },
      },
      orderBy: {
        post_count: "desc",
      },
      take: limit,
      select: {
        name: true,
        post_count: true,
        created_at: true,
      },
    });

    return res.status(200).json(trendingHashtags);
  } catch (err) {
    logger.error("Error fetching trending hashtags:", err);
    return res.status(500).send("Unable to fetch trending hashtags");
  }
};

/**
 * Get detailed information about a specific hashtag
 *
 * @param {Request} req - The incoming request
 * @param {Response} res - The outgoing response
 */
export const getHashtagInfo = async (req: Request, res: Response) => {
  const { tagName } = req.params;

  try {
    const hashtag = await prisma.hashtags.findUnique({
      where: { name: tagName.toLowerCase() },
      select: {
        id: true,
        name: true,
        post_count: true,
        created_at: true,
      },
    });

    if (!hashtag) {
      return res.status(404).json({ message: "Hashtag not found" });
    }

    return res.status(200).json(hashtag);
  } catch (err) {
    logger.error("Error fetching hashtag info:", err);
    return res.status(500).send("Unable to fetch hashtag information");
  }
};
