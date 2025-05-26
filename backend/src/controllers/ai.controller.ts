import { Request, Response } from "express"; // Use general Request, Response for broader compatibility
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2"; // Consider 'llama3' for better quality if available on your Ollama server

// Extend Request type to include user, assuming you have middleware for this
interface RequestWithUser extends Request {
  user?: { id: string; name?: string }; // Add name for convenience
}

export const getNotificationSummary = async (
  req: RequestWithUser,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. Fetch UNREAD notifications from the database
    // IMPORTANT: Added `noti."isRead" = FALSE` to only get unread notifications for a true "summary"
    const notificationsRaw = (await prisma.$queryRaw`
      SELECT
          u.name,
          noti.message,
          noti.type as "notificationcategory",
          p.date, -- post date
          p.desc as "postdesc",
          noti."createdAt" as "notificationCreatedAt" -- actual notification creation time
        FROM notifications noti
        LEFT JOIN users u ON u.id::text = noti.user_sender_id::text
        LEFT JOIN posts p ON p.id::text = noti.resource_id::text
        WHERE noti.user_reciever_id::text = ${userId.toString()} AND noti."isRead" = FALSE
        ORDER BY noti."createdAt" DESC
        LIMIT 10
      `) as any[];

    // Get the current user's name
    const currentUserResult: any =
      await prisma.$queryRaw`SELECT name FROM users WHERE id=${userId}`; // Use userId directly
    const userName = currentUserResult[0]?.name || "there"; // Fallback if name not found

    if (notificationsRaw.length === 0) {
      // If no unread notifications, provide a simple, immediate response
      return res.json({
        summary: `Hey ${userName}! You're all caught up. No new activities from your friends right now.`,
      });
    }

    // 2. Prepare data for AI summary
    const notificationsData = notificationsRaw.map((notif) => {
      // Create a more readable "time ago" for the AI if needed
      const timeElapsed =
        Date.now() - new Date(notif.notificationCreatedAt).getTime();
      const minutes = Math.floor(timeElapsed / (1000 * 60));

      let timeAgo = "";
      if (minutes < 1) timeAgo = "just moments ago";
      else if (minutes < 60) timeAgo = `${minutes} minutes ago`;
      else if (minutes < 1440)
        timeAgo = `${Math.floor(minutes / 60)} hours ago`;
      else timeAgo = "yesterday"; // Or more specific for days

      return {
        from: notif.name || "Someone", // Fallback for sender name
        type: notif.notificationcategory,
        message: notif.message, // raw notification message
        postDescription: notif.postdesc, // description for post-related notifications
        timeAgo: timeAgo, // e.g., "5 minutes ago"
      };
    });

    // 3. Generate AI summary using Ollama
    // --- PROMPT STARTS HERE ---
    const prompt = `
        You are a friendly, conversational, and slightly enthusiastic AI assistant, similar to a personal digital butler. Your primary goal is to brief the user, "${userName}", on their recent social media activities. Make the briefing sound like a friend telling them the news, not a robot reading a list.

        Here are ${userName}'s recent unread notifications, ordered from most recent to oldest:
        ${JSON.stringify(notificationsData, null, 2)}

        **Your task is to generate ONE SINGLE, continuous message that summarizes these notifications.**

        **Guidelines for your summary:**
        - **Greeting:** Start with a warm, personalized greeting that includes the user's name (e.g., "Good morning, ${userName}!" or "Hey ${userName}, ready for your update?").
        - **Flow & Breaks:** Connect sentences naturally. Think of it as telling a friend what happened. Introduce topics smoothly and incorporate natural conversational pauses. For example, use phrases like "First up...", "And then...", "Speaking of that...", "Oh, also...", "Finally...".
        - **Personality:** Be upbeat and engaging. Add subtle observations or lighthearted remarks where appropriate. If something seems interesting or fun, comment on it.
        - **"Laughs" / Expression:** If a notification implies something humorous, exciting, or surprising, you can add a subtle conversational expression like "heh," "lol," or phrases such as "bet that's interesting!", "sounds fun!", "you're gonna love this one!" Try to integrate these naturally into the flow.
        - **Conciseness:** Keep the entire briefing under 150 words.
        - **No Technical Jargon:** Absolutely avoid terms like "notificationcategory," "resource_id," or specific database fields. Translate all information into plain, friendly language. Use relative times like "just now," "a few minutes ago," "earlier today," "yesterday."
        - **Contextualization:** Briefly explain what a notification means if it's not immediately obvious (e.g., "Someone reacted to your post" could become "Someone showed some love for your latest photo").
        - **Closing:** End with a natural closing and a simple, engaging question related to checking activities (e.g., "Ready to dive in?", "Want to check these out?", "Anything pique your interest?").

        **Important:** Your entire response MUST be a single, continuous string of text. Do NOT wrap it in JSON, markdown, or any other formatting besides the natural text itself.

        Begin your single, continuous message now:
    `;
    // --- PROMPT ENDS HERE ---

    /*
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: false, // We want the full response at once
      }),
    });
    */

    // let use Gemini 2.0 Flash Headed
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const geminiData: any = geminiResponse.data;
    console.log("Gemini Data", geminiData);
    console.log(
      "Gemini Data Content",
      geminiData.candidates[0].content.parts[0].text
    );

    /*
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API raw error response:", errorText);
      throw new Error(`Ollama API error: ${errorText}`);
    }

    const data: any = await response.json();

    if (!data?.message?.content) {
      throw new Error("Invalid or empty response from Ollama API");
    }
    */

    // 4. Mark notifications as read
    // This ensures that the next brief only contains new unread notifications.
    // Ensure you uncomment this line once you're confident with the flow.
    await prisma.$executeRaw`
      UPDATE notifications
      SET "isRead" = TRUE
      WHERE "user_reciever_id"::text = ${userId.toString()} AND "isRead" = FALSE;
    `;

    // The frontend expects { summary: string }
    return res.json({
      summary: geminiData.candidates[0].content.parts[0].text.trim(),
    }); // .trim() removes leading/trailing whitespace
  } catch (error) {
    console.error("Error generating notification summary:", error);
    return res.status(500).json({
      // Provide a fallback summary for the frontend
      summary:
        "My apologies, I'm having a bit of trouble getting your updates right now. Please try again later!",
    });
  }
};

// Hey Arush Sharma,
// ready for your social media download?
// Looks like yesterday was a Harry Potter kinda day!
// He posted a TON, like, seven times!
// Mostly looks like tests and then one about "ghibli trends," bet that's interesting!
// Oh, and then there's something about his "chota bhai 🔥,"
// you're gonna love this one! Speaking of Sharma's,
// Shubham Sharma also uploaded a post with "Brothers"
// and let you know that his new video is coming soon.
// Anything pique your interest?
