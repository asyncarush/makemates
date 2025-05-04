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
    <div className="relative inline-flex items-center justify-center w-[110px] font-semibold">
      {/* Main container - smaller and more compact */}
      <div className="relative z-10 flex items-center w-52 px-2 py-1 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg">
        {/* Animated dots - smaller size */}
        <div className="flex items-center space-x-1 mr-2">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                activeDot === dot
                  ? "bg-white scale-100"
                  : "bg-blue-200 bg-opacity-50 scale-75"
              }`}
            ></div>
          ))}
        </div>

        {/* Text - smaller size */}
        <span className="text-[10px] font-medium text-white whitespace-nowrap">
          Generating captions
        </span>
      </div>
    </div>
  );
};

export default AIResponseLoader;
