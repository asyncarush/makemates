import { Pool } from "pg";
import fetch from "node-fetch";

// Type definitions
interface OllamaChatResponse {
  message: {
    content: string;
  };
  model: string;
  created_at: string;
  done: boolean;
}

interface Post {
  id: number;
  desc: string | null;
  date: Date;
  author_name: string;
  media_count: number;
}

interface SimilarPost {
  id: number;
  desc: string | null;
  date: Date;
  author_name: string;
  similarity: number;
}
interface Notification {
  id: number;
  name: string;
  message: string;
  notificationcategory: string;
  date: Date;
  postdesc: string | null;
}
// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    "postgresql://postgres:postgres123@104.197.136.197:30986/makemates",
});

// Configuration
const OLLAMA_API_URL = "http://localhost:11434";
const EMBEDDING_MODEL = "llama3.2";
const EMBEDDING_DIMENSIONS = 3072;
const FIRST_PART_DIMENSIONS = 2000;
const BATCH_SIZE = 10;

/**
 * Service for managing post embeddings using Ollama and pgvector
 */
class EmbeddingService {
  /**
   * Find similar posts to a given post using vector similarity
   * @param postId - ID of the source post
   * @param userId - ID of the user making the request
   * @param limit - Maximum number of similar posts to return
   * @returns Array of similar posts
   */
  async findSimilarPosts(
    postId: number,
    userId: number,
    limit = 5
  ): Promise<SimilarPost[]> {
    try {
      // 1. Verify user has access to the source post
      const accessQuery = `
        SELECT p.id
        FROM posts p
        WHERE p.id = $1 AND (
          p.user_id = $2 OR
          EXISTS (
            SELECT 1 FROM relationships r
            WHERE r.follower_id = $2 AND r.follow_id = p.user_id
          )
        )
      `;

      const accessResult = await pool.query(accessQuery, [postId, userId]);

      if (accessResult.rows.length === 0) {
        throw new Error("Access denied to the requested post");
      }

      // 2. Get the embedding for the source post
      const embeddingQuery = `
        SELECT embedding 
        FROM post_embeddings 
        WHERE post_id = $1
      `;

      const embeddingResult = await pool.query(embeddingQuery, [postId]);

      if (embeddingResult.rows.length === 0) {
        throw new Error("No embedding found for the source post");
      }

      const sourceEmbedding = embeddingResult.rows[0].embedding;

      // 3. Find similar posts the user is allowed to see
      const similarPostsQuery = `
        SELECT 
          p.id,
          p.desc,
          p.date,
          u.name AS author_name,
          1 - (pe.embedding <=> $1) AS similarity
        FROM 
          post_embeddings pe
        JOIN 
          posts p ON pe.post_id = p.id
        JOIN 
          users u ON p.user_id = u.id
        WHERE 
          pe.post_id != $2 AND (
            p.user_id = $3 OR
            EXISTS (
              SELECT 1 FROM relationships r
              WHERE r.follower_id = $3 AND r.follow_id = p.user_id
            )
          )
        ORDER BY 
          similarity DESC
        LIMIT $4
      `;

      const similarPostsResult = await pool.query<SimilarPost>(
        similarPostsQuery,
        [sourceEmbedding, postId, userId, limit]
      );

      return similarPostsResult.rows;
    } catch (error) {
      console.error("Error finding similar posts:", error);
      throw error;
    }
  }

  /**
   * Generate an AI summary of recent posts for a user
   * @param userId - ID of the user requesting the summary
   * @returns AI-generated summary
   */
  async generateUserFeedSummary(userId: number): Promise<string> {
    try {
      // 1. Get posts from friends
      const feedQuery = `
        SELECT 
          p.id,
          p.desc,
          p.date,
          u.name AS author_name,
          COUNT(pm.id)::integer AS media_count
        FROM 
          posts p
        JOIN 
          users u ON p.user_id = u.id
        LEFT JOIN 
          post_media pm ON p.id = pm.post_id
        WHERE 
          p.user_id IN (
            SELECT follow_id 
            FROM relationships 
            WHERE follower_id = $1
          )
        GROUP BY 
          p.id, p.desc, p.date, u.name
        ORDER BY 
          p.date DESC
        LIMIT 10
      `;

      const feedResult = await pool.query<Post>(feedQuery, [userId]);

      if (feedResult.rows.length === 0) {
        return "No recent updates from your friends.";
      }

      // 2. Prepare posts data for AI summary
      const postsData = feedResult.rows.map((post) => ({
        author: post.author_name,
        description: post.desc || "",
        date: new Date(post.date).toLocaleDateString(),
        hasMedia: post.media_count > 0,
      }));

      // 3. Generate summary using Ollama chat API
      const prompt = `
        Here's a summary of recent posts from people I follow:
        ${JSON.stringify(postsData, null, 2)}
        
        Please create a brief, friendly summary of what my friends have been up to.
        Focus on key highlights and interesting trends. Be conversational and engaging.
      `;

      const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${error}`);
      }

      const data = (await response.json()) as OllamaChatResponse;

      if (!data?.message?.content) {
        throw new Error("Invalid response format from Ollama API");
      }

      return data.message.content;
    } catch (error) {
      console.error("Error generating feed summary:", error);
      return "Sorry, I couldn't generate a summary at this time.";
    }
  }

  async getNotificationSummary(userId: number): Promise<string> {
    try {
      // 1. Fetch unread notifications from database
      // Update the SELECT query to use proper column aliases
      const notificationsQuery = `
  SELECT 
    u.name,
    noti.message,
    noti.type as notificationCategory,  -- No quotes needed here
    p.date,
    p.desc as postDesc  -- No quotes needed here
  FROM notifications noti
  LEFT JOIN users u ON u.id = noti.user_sender_id
  LEFT JOIN posts p ON p.id = noti.resource_id
  WHERE noti.user_reciever_id = $1
  ORDER BY noti."createdAt" DESC  -- Keep quotes if this is case-sensitive
  LIMIT 10
`;

      const result = await pool.query<Notification>(notificationsQuery, [
        userId,
      ]);

      console.log("Notifications result:", result.rows);

      if (result.rows.length === 0) {
        return "You're all caught up! No new notifications.";
      }

      // 2. Prepare data for AI summary
      // Update the mapping to use the correct property names
      const notificationsData = result.rows.map((notif) => ({
        from: notif.name,
        type: notif.notificationcategory, // Use the alias we defined
        postDescription: notif.postdesc, // Use the alias we defined
        time: new Date(notif.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      console.log("Notifications data:", notificationsData);
      // 3. Generate AI summary
      const prompt = `
        You are a helpful AI assistant that summarizes notifications in a fun, engaging way.
        Here are the user's recent notifications:
  
        ${JSON.stringify(notificationsData, null, 2)}
  
        Please create a brief, friendly summary of these notifications.
        - Keep it concise (4-5 sentences max)
        - Be conversational and engaging
        - Include emojis to make it more lively
        - If there are post interactions, mention them naturally
        - Don't mention specific timestamps
        - Keep it under 100 words
  
        Example: "Hey there You got updates to catch! It seems like John is in Shimla He just post something from their and enjoying the hillstations, eating foods 😎😉"
      `;

      const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${error}`);
      }

      const data = (await response.json()) as OllamaChatResponse;

      if (!data?.message?.content) {
        throw new Error("Invalid response format from Ollama API");
      }

      // 4. Mark notifications as read (optional)
      // if (result.rows.length > 0) {
      //   const notificationIds = result.rows
      //     .map((_, index) => `$${index + 1}`)
      //     .join(",");
      //   await pool.query(
      //     `UPDATE notifications SET isRead = true
      //      WHERE id IN (${notificationIds})`,
      //     result.rows.map((notif) => notif.id)
      //   );
      // }

      return data.message.content;
    } catch (error) {
      console.error("Error generating notification summary:", error);
      return "I couldn't generate a notification summary right now. Please check back later!";
    }
  }
}

// Example usage
const embeddingService = new EmbeddingService();

// // Test the similar posts functionality
// embeddingService
//   .findSimilarPosts(1, 1)
//   .then((result) => {
//     console.log("Similar posts:", result);
//   })
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });

// // Test the feed summary functionality
// embeddingService
//   .generateUserFeedSummary(1)
//   .then((summary) => {
//     console.log("Feed summary:", summary);
//   })
//   .catch((error) => {
//     console.error("Error generating summary:", error.message);
//   });

embeddingService
  .getNotificationSummary(1)
  .then((summary) => {
    console.log("Notification summary:", summary);
  })
  .catch((error) => {
    console.error("Error generating notification summary:", error.message);
  });
