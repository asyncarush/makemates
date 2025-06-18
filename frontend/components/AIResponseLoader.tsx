import { useEffect, useState } from "react";

export const AIResponseLoader = () => {
  // Animation timing for dots
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative items-center justify-center font-semibold">
      {/* Main container - smaller and more compact */}
      <div className="relative z-10 flex items-center p-1 rounded-2xl">
        {/* Animated dots - smaller size */}
        <div className="flex items-center space-x-1 mr-2 text-black dark:text-gray-300">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                activeDot === dot
                  ? "bg-white/50 scale-100"
                  : "bg-blue-200 bg-opacity-50 scale-75"
              }`}
            ></div>
          ))}
        </div>

        {/* Text - smaller size */}
        <span className="text-[10px] font-medium text-white dark:text-gray-400 whitespace-nowrap">
          Generating captions
        </span>
      </div>
    </div>
  );
};

export default AIResponseLoader;
