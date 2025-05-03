"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface AIAssistantProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  initialMessage?: string;
  theme?: "light" | "dark";
}

interface Notification {
  id: string;
  message: string;
  type: "post" | "message" | "system";
  read: boolean;
}

// Declare the SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

const AIAssistant = ({
  position = "bottom-right",
  initialMessage = "Hi there! I'll notify you about new posts and messages.",
  theme = "light",
}: AIAssistantProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(initialMessage);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  // Theme classes
  const themeClasses = {
    light: {
      bubble: "bg-white text-gray-800 border border-gray-100",
      button: "from-blue-600 to-teal-400",
      text: "text-gray-800",
      shadow: "shadow-lg shadow-blue-500/20",
    },
    dark: {
      bubble: "bg-gray-800 text-white border border-gray-700",
      button: "from-indigo-600 to-blue-500",
      text: "text-white",
      shadow: "shadow-lg shadow-indigo-500/30",
    },
  };

  // Initialize speech recognition (if available in browser)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use type assertion for browser compatibility
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            handleCommand(transcript);
            setIsListening(false);
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Mock function to add a notification (would be connected to your actual notification system)
  const addNotification = (
    message: string,
    type: "post" | "message" | "system"
  ) => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    speakMessage(message);

    // Pulse animation
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 2000);

    // If not active, show the notification
    if (!isActive) {
      setCurrentMessage(message);
      setIsActive(true);
    }
  };

  // Simple speech synthesis
  const speakMessage = (message: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(message);
      speech.rate = 1.1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  };

  // Handle voice commands
  const handleCommand = (command: string) => {
    if (command.includes("new post") || command.includes("posts")) {
      setCurrentMessage("Let me check for new posts...");
      // Here you would trigger an API call to check for new posts
    } else if (command.includes("message") || command.includes("messages")) {
      setCurrentMessage("Checking for new messages...");
      // Here you would trigger an API call to check for messages
    } else if (command.includes("close") || command.includes("hide")) {
      setIsActive(false);
    } else {
      setCurrentMessage(
        "I didn't understand that command. Try asking about posts or messages."
      );
    }
  };

  // Toggle listening mode
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setIsActive(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setCurrentMessage("Listening...");
        } catch (error) {
          console.error("Error starting speech recognition:", error);
        }
      } else {
        setCurrentMessage("Speech recognition not supported in this browser.");
      }
    }
  };

  // Clear unread count when opening the assistant
  useEffect(() => {
    if (isActive) {
      setUnreadCount(0);
    }
  }, [isActive]);

  // For demo purposes - simulate receiving notifications
  // useEffect(() => {

  //   }, 5000);

  //   return () => clearTimeout(demoTimeout);
  // }, []);

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40 flex flex-col items-end`}
    >
      {/* Message bubble */}
      {isActive && (
        <div
          ref={messageRef}
          className={`mb-3 p-4 rounded-2xl ${themeClasses[theme].bubble} ${themeClasses[theme].shadow} max-w-xs backdrop-blur-sm`}
          style={{
            animation: "bounceIn 0.4s cubic-bezier(0.38, 0.1, 0.36, 1.22)",
            transformOrigin: "bottom right",
          }}
        >
          {/* Pointer triangle */}
          <div
            className={`absolute bottom-[-8px] right-4 w-4 h-4 rotate-45 ${themeClasses[theme].bubble}`}
          ></div>

          {/* Message content */}
          <div className="relative">
            <p className={`text-sm ${themeClasses[theme].text}`}>
              {currentMessage}
            </p>

            {/* Actions */}
            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => setIsActive(false)}
                className={`text-xs ${
                  theme === "light"
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-gray-400 hover:text-white"
                } transition-colors`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant button */}
      <button
        onClick={() => {
          if (isListening) {
            toggleListening();
          } else {
            setIsActive(!isActive);
          }
        }}
        onDoubleClick={toggleListening}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r ${themeClasses[theme].button} ${themeClasses[theme].shadow} hover:scale-105 active:scale-95 transition-all duration-300`}
      >
        {/* Background animation */}
        <div
          className={`absolute inset-0 rounded-full ${
            isListening || isPulsing ? "animate-pulse" : ""
          }`}
        >
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${themeClasses[theme].button} opacity-60`}
            style={{
              animation: isPulsing
                ? "strongPulse 2s cubic-bezier(0.4, 0, 0.6, 1)"
                : isListening
                ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                : "none",
            }}
          />
        </div>

        {/* Unread badge */}
        {unreadCount > 0 && !isActive && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white animate-bounce">
            {unreadCount}
          </div>
        )}

        {/* Microphone or AI icon */}
        <div className="relative z-10">
          {isListening ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 10V12C5 16.4183 8.13401 20 12 20C15.866 20 19 16.4183 19 12V10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 20V23"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
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
          )}
        </div>

        {/* Animated sound waves when listening */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="sound-waves">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="sound-wave"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </button>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px);
          }
          40% {
            opacity: 1;
            transform: scale(1.05) translateY(-5px);
          }
          60% {
            transform: scale(0.95) translateY(2px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @keyframes strongPulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }

        .sound-waves {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sound-wave {
          position: absolute;
          border: 1.5px solid rgba(255, 255, 255, 0.5);
          border-radius: 100%;
          animation: sound-wave-animate 2s ease-out infinite;
        }

        @keyframes sound-wave-animate {
          0% {
            width: 30%;
            height: 30%;
            opacity: 0;
          }
          40% {
            opacity: 0.5;
          }
          100% {
            width: 200%;
            height: 200%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
