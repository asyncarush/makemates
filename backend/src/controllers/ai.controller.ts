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
    // 1. Fetch recent notifications (last 24 hours) regardless of read status
    // This ensures the AI can summarize activities even if user checked notification panel
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const notificationsRaw = (await prisma.$queryRaw`
      SELECT
          u.name,
          u.img as "profileImage",
          noti.message,
          noti.type as "notificationcategory",
          noti."isRead",
          p.date, -- post date
          p.desc as "postdesc",
          noti."createdAt" as "notificationCreatedAt", -- actual notification creation time
          noti.resource_id as "resourceId",
          (SELECT COUNT(*) FROM post_media WHERE post_id = p.id) as "mediaCount"
        FROM notifications noti
        LEFT JOIN users u ON u.id::text = noti.user_sender_id::text
        LEFT JOIN posts p ON p.id::text = noti.resource_id::text AND noti.type = 'post'
        WHERE noti.user_reciever_id::text = ${userId.toString()}
          AND noti."createdAt" >= ${twentyFourHoursAgo}
        ORDER BY noti."createdAt" DESC
        LIMIT 20
      `) as any[];

    // Get the current user's name
    const currentUserResult: any =
      await prisma.$queryRaw`SELECT name FROM users WHERE id=${userId}`; // Use userId directly
    const userName = currentUserResult[0]?.name || "there"; // Fallback if name not found

    // Count actual unread notifications for the indicator
    const unreadCount = notificationsRaw.filter((n) => !n.isRead).length;

    if (notificationsRaw.length === 0) {
      // If no notifications in the last 24 hours
      return res.json({
        summary: `Hey ${userName}! Pretty quiet around here. No new activities from your friends in the last 24 hours.`,
        unreadCount: 0,
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

      const mediaCount = parseInt(notif.mediaCount) || 0;

      return {
        from: notif.name || "Someone", // Fallback for sender name
        type: notif.notificationcategory,
        message: notif.message, // Now includes dynamic info like "shared 3 photos about #travel"
        postDescription: notif.postdesc, // description for post-related notifications
        hasMedia: mediaCount > 0,
        mediaCount: mediaCount,
        timeAgo: timeAgo, // e.g., "5 minutes ago"
      };
    });

    // 3. Generate AI summary using Gemini
    // --- PROMPT STARTS HERE ---
    const prompt = `
        You are a friendly, conversational AI assistant acting as "${userName}'s" personal social media briefing assistant. Your job is to give them a natural spoken update that will be converted to speech, about what their friends have been up to on the platform.

        Here are ${userName}'s recent notifications from the last 24 hours, ordered from most recent to oldest:
        ${JSON.stringify(notificationsData, null, 2)}

        **Your task is to generate ONE SINGLE, flowing spoken message that will be read aloud naturally.**

        **Guidelines for your summary:**
        - **Warm Greeting:** Start with a friendly, natural greeting (e.g., "Hey ${userName}!", "What's up ${userName}?", "Hi there!").
        - **Conversational Flow:** Write as if you're speaking to them directly. Use natural pauses indicated by commas and periods.
        - **Highlight Key Activities:** Focus on the most interesting updates. Mention:
          * New posts (especially with photos/videos or hashtags)
          * Comments or interactions
          * New followers
          * Use the actual message content which now includes details like "shared 3 photos about #travel"
        - **Natural Speech Patterns:** Use conversational phrases like "Looks like...", "Your friend...", "Also...", "Oh, and..."
        - **Keep it Concise:** Aim for 80-120 words. Natural speaking length.
        - **Use Plain Language:** Make it sound like a friend talking to them, not a formal report.
        - **Time References:** Use natural time phrases like "just now", "a few minutes ago", "earlier", "today".
        - **Friendly Close:** End with something natural like "Want to check it out?", "Ready to see what's new?", or "Should we take a look?"

        **Critical Requirements:**
        - Write EXACTLY how you would speak it out loud
        - Must be a single flowing paragraph
        - NO markdown, NO formatting, NO JSON
        - Should sound natural when spoken by a text-to-speech system
        - Use proper punctuation for natural speech pauses

        Generate the spoken briefing message now (plain text only):
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

    // 4. DON'T mark notifications as read here
    // Let the user mark them as read manually via the notification panel
    // This prevents conflict with the notification badge system

    // The frontend expects { summary: string }
    return res.json({
      summary: geminiData.candidates[0].content.parts[0].text.trim(),
      unreadCount: unreadCount, // Include count for UI indicator (only unread ones)
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
