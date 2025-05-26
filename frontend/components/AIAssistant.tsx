"use client";

import React, { useState, useCallback, useEffect } from "react";

type NotificationMessage = { text: string };

interface AIAssistantProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  initialMessage?: string;
  theme?: "light" | "dark";
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  position = "bottom-right",
  initialMessage = "Hi there! I'll notify you about new posts and messages.",
  theme = "light",
}) => {
  // State
  const [isActive, setIsActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(false);

  // 11Labs TTS
  const speakWith11Labs = useCallback(async (text: string) => {
    if (!text) return;
    try {
      // It's generally not recommended to hardcode API keys directly in client-side code.
      // Consider using environment variables or a backend proxy for security.
      const apiKey = "sk_f434de7b18e76285291b7acec64255c8100af1fb643fab80"; // Replace with your actual key or env var
      const voiceId = "UgBBYS2sOqTuMpoF3BR0"; // Replace with your desired voice ID
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`TTS failed: ${JSON.stringify(errorData)}`);
      }

      const audioData = await response.arrayBuffer();
      const audioUrl = URL.createObjectURL(
        new Blob([audioData], { type: "audio/mpeg" })
      );
      const audio = new Audio(audioUrl);

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl); // Clean up the URL after playing
          resolve();
        };
        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          reject(e);
        };
        audio.play().catch((e) => {
          URL.revokeObjectURL(audioUrl);
          reject(e);
        });
      });
    } catch (err) {
      console.error("11Labs TTS error:", err);
      // Optionally provide a fallback visual/text message to the user
      setCurrentMessage("Sorry, I'm having trouble speaking right now.");
    }
  }, []);

  // Fetch notification summary
  const fetchNotificationSummary = useCallback(async (): Promise<
    NotificationMessage[] // Still return an array, but now with one object for the full brief
  > => {
    try {
      const response = await fetch(
        "http://localhost:2000/api/ai/notificationSummary",
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch notifications: ${response.statusText}`
        );
      }
      const data = await response.json();

      // IMPORTANT CHANGE HERE: Expecting a single string 'summary' from backend
      if (typeof data.summary === "string") {
        return [{ text: data.summary }]; // Wrap the single string in an array for showNotifications
      }

      console.error(
        "Backend returned an unexpected summary format:",
        data.summary
      );
      return [{ text: "Oops! Couldn't get your full brief right now." }]; // Fallback
    } catch (err) {
      console.error("Fetch notifications error:", err);
      // Ensure currentMessage is updated to inform the user
      setCurrentMessage("Couldn't fetch your friend's activities right now.");
      return [{ text: "Couldn't fetch your friend's activities right now." }]; // Return a default message
    }
  }, []);

  // Sequentially show and speak notifications
  const showNotifications = useCallback(
    async (messages: NotificationMessage[], initialDelay = 1000) => {
      await new Promise((res) => setTimeout(res, 300));
      for (let i = 0; i < messages.length; i++) {
        setCurrentMessage(messages[i].text);
        await new Promise((res) => setTimeout(res, 400));
        await speakWith11Labs(messages[i].text);
        await new Promise((res) => setTimeout(res, initialDelay));
        if (i < messages.length - 1) {
          await new Promise((res) => setTimeout(res, 400));
        }
      }
      // After all messages, auto-dismiss the popup
      setIsActive(false);
    },
    [speakWith11Labs]
  );

  // When the assistant button is clicked, show popup and auto-brief/auto-notify
  useEffect(() => {
    if (isActive) {
      (async () => {
        setIsLoading(true);
        // Only fetch and show notifications
        const messages = await fetchNotificationSummary();
        setIsLoading(false);
        if (messages.length > 0) {
          await showNotifications(messages);
        }
      })();
    }
  }, [isActive, fetchNotificationSummary, showNotifications]);

  // Auto-open the assistant popup on mount for initial brief
  useEffect(() => {
    setIsActive(true);
  }, []);

  // Add back the assistant button and toggle logic
  const handleAssistantToggle = () => setIsActive((prev) => !prev);

  // UI classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };
  const themeClasses = {
    light: {
      bubble: "bg-white/85 text-gray-800 border border-gray-200",
      button: "bg-white/90",
      text: "text-gray-800",
      shadow: "shadow-none",
    },
    dark: {
      bubble: "bg-slate-800/85 text-white border border-gray-700",
      button: "bg-slate-800/90",
      text: "text-white",
      shadow: "shadow-none",
    },
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40 flex flex-col items-end`}
    >
      {/* Popup container - overall visibility controlled by isActive */}
      {isActive && (
        <div
          className={`mb-2 p-3 rounded-xl max-w-sm min-w-[240px] relative ${themeClasses[theme].bubble} ${themeClasses[theme].shadow} animate-popup-in`}
          style={{ zIndex: 100 }}
        >
          {/* Pointer triangle */}
          <div
            className={`absolute bottom-[-6px] ${
              position.includes("right") ? "right-3" : "left-3"
            } w-3 h-3 rotate-45 ${themeClasses[theme].bubble}`}
          ></div>
          <div className="relative pt-2 ">
            <p
              className={`text-sm font-normal leading-snug ${themeClasses[theme].text} transition-opacity duration-300 opacity-100`}
            >
              {isLoading ? "Checking for updates..." : currentMessage}
            </p>
          </div>
        </div>
      )}
      {/* AI Assistant button */}
      <button
        onClick={handleAssistantToggle}
        className={`relative flex items-center justify-center w-11 h-11 rounded-full ${themeClasses[theme].button} ${themeClasses[theme].shadow} border border-gray-200 hover:scale-105 active:scale-95 transition-all duration-300`}
        aria-label="AI Assistant"
      >
        <div className="relative z-10">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-500"
          >
            <path
              d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.3264 15.8363C7.89626 16.5871 6 18.1189 6 20.0004C6 22.4857 8.68629 24.0004 12 24.0004C15.3137 24.0004 18 22.4857 18 20.0004C18 18.1188 16.1037 16.5871 13.6736 15.8363"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M15 8C15 8 16 9 16 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </button>
      <style jsx>{`
        /* Animation for the entire popup container appearing */
        @keyframes popupIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        /* No need for a separate popupOut animation if we just unmount with isActive */
        .animate-popup-in {
          animation: popupIn 0.4s cubic-bezier(0.38, 0.1, 0.36, 1.22) forwards;
        }
        /* The message content itself will now fade in/out using state */
      `}</style>
    </div>
  );
};

export default AIAssistant;
