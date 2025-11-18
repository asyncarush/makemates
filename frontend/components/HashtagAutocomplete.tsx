"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_ENDPOINT } from "@/axios.config";

interface HashtagSuggestion {
  name: string;
  post_count: number;
}

interface HashtagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

const HashtagAutocomplete: React.FC<HashtagAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
  className = "",
  rows = 3,
}) => {
  const [suggestions, setSuggestions] = useState<HashtagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get the current word being typed (for hashtag detection)
  const getCurrentWord = (text: string, position: number): string => {
    const beforeCursor = text.slice(0, position);
    const words = beforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];
    return currentWord;
  };

  useEffect(() => {
    const currentWord = getCurrentWord(value, cursorPosition);

    // Check if user is typing a hashtag
    if (currentWord.startsWith("#") && currentWord.length > 1) {
      const query = currentWord.slice(1); // Remove # symbol

      // Fetch hashtag suggestions
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(
            `${API_ENDPOINT}/hashtags/search?q=${query}`,
            { withCredentials: true }
          );
          setSuggestions(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching hashtag suggestions:", error);
          setSuggestions([]);
        }
      };

      fetchSuggestions();
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [value, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSuggestionClick = (hashtag: string) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);

    // Find the start of the current hashtag
    const words = beforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    // Replace the current partial hashtag with the selected one
    const newBeforeCursor = beforeCursor.slice(0, -currentWord.length);
    const newValue = newBeforeCursor + "#" + hashtag + " " + afterCursor;

    onChange(newValue);
    setShowSuggestions(false);

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={handleChange}
        onClick={(e) =>
          setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)
        }
        onKeyUp={(e) =>
          setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)
        }
      />

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              onClick={() => handleSuggestionClick(suggestion.name)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                #{suggestion.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {suggestion.post_count} posts
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HashtagAutocomplete;
