"use client";

import React from "react";

interface SimpleLoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

const SimpleLoader = ({ size = "medium", text }: SimpleLoaderProps) => {
  // Size mappings
  const sizeClasses = {
    small: {
      container: "py-2",
      text: "text-sm",
      dot: "w-1.5 h-1.5",
      gap: "gap-1.5",
    },
    medium: {
      container: "py-3",
      text: "text-base",
      dot: "w-2 h-2",
      gap: "gap-2",
    },
    large: {
      container: "py-4",
      text: "text-xl",
      dot: "w-2.5 h-2.5",
      gap: "gap-2.5",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`flex flex-col items-center justify-center ${classes.container}`}
    >
      {text && (
        <p
          className={`${classes.text} font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-2`}
        >
          {text}
        </p>
      )}

      {/* AI "thinking" dots */}
      <div className={`flex justify-center ${classes.gap}`}>
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className={`${classes.dot} rounded-full bg-gradient-to-r from-blue-600 to-teal-400`}
            style={{
              animation: `simplePulseLoader 1.5s ease-in-out ${
                dot * 0.2
              }s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes simplePulseLoader {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleLoader;
