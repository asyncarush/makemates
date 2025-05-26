import { Pool } from "pg";
import fetch from "node-fetch";

// Type definitions
interface OllamaEmbeddingResponse {
  embedding: number[];
  model: string;
}

interface Post {
  id: number;
  desc: string | null;
  date: Date;
  user_name: string;
  media_count: number;
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
const BATCH_SIZE = 10; // Process posts in batches to avoid overloading the API

class EmbeddingService {
  /**
   * Process all posts and generate embeddings
   */
  async processAllPosts() {
    try {
      // Get total count of posts
      const countResult = await pool.query(
        "SELECT COUNT(*) as total FROM posts"
      );
      const totalPosts = parseInt(countResult.rows[0].total);
      console.log(`Found ${totalPosts} posts to process`);

      let offset = 0;
      let processed = 0;

      while (offset < totalPosts) {
        console.log(`Processing batch ${offset / BATCH_SIZE + 1}...`);

        // Get a batch of posts
        const postsQuery = `
          SELECT 
            p.id,
            p.desc,
            p.date,
            u.name AS user_name,
            COUNT(pm.id)::integer AS media_count
          FROM 
            posts p
          JOIN 
            users u ON p.user_id = u.id
          LEFT JOIN 
            post_media pm ON p.id = pm.post_id
          GROUP BY 
            p.id, p.desc, p.date, u.name
          ORDER BY 
            p.id
          LIMIT $1 OFFSET $2
        `;

        const postsResult = await pool.query<Post>(postsQuery, [
          BATCH_SIZE,
          offset,
        ]);

        if (postsResult.rows.length === 0) {
          break;
        }

        // Process each post in the batch
        for (const post of postsResult.rows) {
          try {
            await this.processSinglePost(post);
            processed++;
            console.log(
              `Processed post ${post.id} (${processed}/${totalPosts})`
            );
          } catch (error) {
            console.error(
              `Error processing post ${post.id}:`,
              (error as Error).message
            );
          }
        }

        offset += BATCH_SIZE;
      }

      console.log(`Completed! Processed ${processed} posts.`);
      return { success: true, processed };
    } catch (error) {
      console.error("Error processing posts:", error);
      throw error;
    }
  }

  /**
   * Process a single post and store its embedding
   */
  private async processSinglePost(post: Post) {
    // 1. Create text for embedding
    const textForEmbedding = `
      Post by ${post.user_name}
      Description: ${post.desc || ""}
      Date: ${new Date(post.date).toISOString()}
      Media Count: ${post.media_count}
    `.trim();

    // 2. Generate embedding using Ollama API
    const response = await fetch(`${OLLAMA_API_URL}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: textForEmbedding,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = (await response.json()) as OllamaEmbeddingResponse;
    const embedding = data.embedding;

    // 3. Split the embedding into two parts
    const embeddingPart1 = embedding.slice(0, FIRST_PART_DIMENSIONS);
    const embeddingPart2 = embedding.slice(FIRST_PART_DIMENSIONS);

    // 4. Store the embeddings in the database
    const insertQuery = `
      INSERT INTO post_embeddings 
        (post_id, embedding, embedding_part2, model_name)
      VALUES 
        ($1, $2, $3, $4)
      ON CONFLICT (post_id) 
      DO UPDATE SET 
        embedding = $2,
        embedding_part2 = $3,
        model_name = $4,
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.query(insertQuery, [
      post.id,
      JSON.stringify(embeddingPart1),
      JSON.stringify(embeddingPart2),
      EMBEDDING_MODEL,
    ]);
  }
}

// Run the script
const embeddingService = new EmbeddingService();

// Handle command line arguments
const args = process.argv.slice(2);
if (args[0] === "--process-all") {
  console.log("Starting to process all posts...");
  embeddingService
    .processAllPosts()
    .then(() => {
      console.log("Processing completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Processing failed:", error);
      process.exit(1);
    });
} else {
  console.log("Usage: ts-node generate_emb.ts --process-all");
  process.exit(1);
}
