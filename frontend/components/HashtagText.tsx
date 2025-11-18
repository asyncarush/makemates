"use client";

import React from "react";
import Link from "next/link";

interface HashtagTextProps {
  text: string;
  className?: string;
}

/**
 * Component that parses text and renders hashtags as clickable links
 * @param text - The text content that may contain hashtags
 * @param className - Optional CSS classes to apply to the text container
 */
const HashtagText: React.FC<HashtagTextProps> = ({ text, className = "" }) => {
  if (!text) return null;

  // Regex to match hashtags
  const hashtagRegex = /(#\w+)/g;

  // Split text by hashtags while keeping the hashtags
  const parts = text.split(hashtagRegex);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        // Check if this part is a hashtag
        if (part.match(hashtagRegex)) {
          // Remove the # symbol for the route
          const tagName = part.slice(1);

          return (
            <Link
              key={index}
              href={`/hashtag/${tagName.toLowerCase()}`}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
              onClick={(e) => e.stopPropagation()} // Prevent parent click events
            >
              {part}
            </Link>
          );
        }

        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

export default HashtagText;
