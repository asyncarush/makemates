"use client";

import React, { useState, useCallback, useEffect } from "react";
import { BACKEND_API } from "../axios.config";

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
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Maya1 TTS (Open Source!)
  const speakWithMaya1 = useCallback(async (text: string) => {
    if (!text) return;

    try {
      // Call backend TTS endpoint which proxies to Maya1 service
      const response = await BACKEND_API.post(
        "/api/tts/generate",
        {
          text,
          voiceDescription: "A friendly, warm female voice with natural expression",
          rate: 1.0,
        },
        {
          responseType: "arraybuffer",
          timeout: 30000, // 30 second timeout
        }
      );

      // Create audio from response
      const audioBlob = new Blob([response.data], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Play audio and wait for it to finish
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          console.error("Audio playback error:", e);
          reject(e);
        };
        audio.play().catch((e) => {
          URL.revokeObjectURL(audioUrl);
          reject(e);
        });
      });
    } catch (err: any) {
      console.error("Maya1 TTS error:", err);

      // Fallback to browser TTS if Maya1 fails
      if (window.speechSynthesis) {
        console.log("Falling back to browser TTS...");
        return new Promise<void>((resolve) => {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }
    }
  }, []);

  // Fetch notification summary
  const fetchNotificationSummary = useCallback(async (): Promise<string> => {
    try {
      const { data } = await BACKEND_API.get("/api/ai/notificationSummary");

      // Update unread count for indicator
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
        setHasNewUpdates(data.unreadCount > 0);
      }

      // Return the full summary as a single string
      if (typeof data.summary === "string") {
        return data.summary;
      }

      console.error(
        "Backend returned an unexpected summary format:",
        data.summary
      );
      return "Oops! Couldn't get your full brief right now.";
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setCurrentMessage("Couldn't fetch your friend's activities right now.");
      return "Couldn't fetch your friend's activities right now.";
    }
  }, []);

  // Show and speak the full notification summary
  const showNotifications = useCallback(
    async (message: string) => {
      // Brief pause before showing
      await new Promise((res) => setTimeout(res, 500));

      // Display the full message
      setCurrentMessage(message);
      await new Promise((res) => setTimeout(res, 300));

      // Speak the entire message at once with Maya1 TTS
      await speakWithMaya1(message);

      // Keep popup open for 5 more seconds after speech finishes
      await new Promise((res) => setTimeout(res, 5000));
      setIsActive(false);
      // Mark that updates have been seen
      setHasNewUpdates(false);
    },
    [speakWithMaya1]
  );

  // When the assistant button is clicked, show popup and auto-brief/auto-notify
  useEffect(() => {
    if (isActive) {
      (async () => {
        setIsLoading(true);
        // Fetch the full notification summary
        const message = await fetchNotificationSummary();
        setIsLoading(false);
        if (message && message.trim().length > 0) {
          await showNotifications(message);
        }
      })();
    }
  }, [isActive, fetchNotificationSummary, showNotifications]);

  // Periodic polling to check for new activities (every 3 minutes)
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const { data } = await BACKEND_API.get("/api/ai/notificationSummary");
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
          setHasNewUpdates(data.unreadCount > 0);
        } else {
          setHasNewUpdates(false);
          setUnreadCount(0);
        }
      } catch (err) {
        console.error("Error checking for updates:", err);
      }
    };

    // Check immediately on mount
    checkForUpdates();

    // Then check every 3 minutes (more frequent for better UX)
    const interval = setInterval(checkForUpdates, 3 * 60 * 1000);

    return () => clearInterval(interval);
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
          {/* Close button */}
          <button
            onClick={() => {
              setIsActive(false);
              setHasNewUpdates(false);
            }}
            className="absolute top-1 right-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Pointer triangle */}
          <div
            className={`absolute bottom-[-6px] ${
              position.includes("right") ? "right-3" : "left-3"
            } w-3 h-3 rotate-45 ${themeClasses[theme].bubble}`}
          ></div>
          <div className="relative pt-2 pr-4">
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
        className={`relative flex items-center justify-center w-11 h-11 rounded-full ${themeClasses[theme].button} ${themeClasses[theme].shadow} border border-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 ${
          hasNewUpdates ? "ring-2 ring-blue-500 ring-offset-2 animate-pulse" : ""
        }`}
        aria-label="AI Assistant"
      >
        {/* New updates indicator */}
        {hasNewUpdates && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
            {unreadCount}
          </div>
        )}
        <div className="relative z-10">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className={hasNewUpdates ? "text-blue-600" : "text-blue-500"}
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
