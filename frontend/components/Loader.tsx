"use client";

import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="relative text-center">
        <h1 className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">
          make<span className="font-semibold">mates</span>
        </h1>

        {/* AI "thinking" dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-teal-400"
              style={{
                animation: `pulseLoader 1.5s ease-in-out ${
                  dot * 0.2
                }s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseLoader {
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

export default Loader;
