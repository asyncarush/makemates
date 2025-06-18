import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { API_ENDPOINT } from "@/axios.config";

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const endpoint = `${API_ENDPOINT}/search/user`;
        console.log("Search endpoint:", endpoint);

        const res = await axios.post(
          endpoint,
          { keyword: searchTerm },
          { withCredentials: true }
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 2000);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-gray-900/90 backdrop-blur-sm rounded-full focus-within:bg-white/20 dark:focus-within:bg-gray-800/95 focus-within:border-white/30 dark:focus-within:border-blue-500/30 border border-transparent dark:border-gray-700/50 transition-all duration-200 relative">
        <FaSearch className="w-4 h-4 text-white/70 dark:text-blue-400/80" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none text-white dark:text-gray-100 placeholder-white/70 dark:placeholder-blue-300/60"
        />
        {searchTerm && (
          <button
            aria-label="Clear search"
            className="absolute right-3 text-white/60 dark:text-blue-400/70 hover:text-white/90 dark:hover:text-blue-300 transition-colors"
            onClick={() => setSearchTerm("")}
            tabIndex={0}
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {searchTerm.trim() && (
        <div className="absolute w-full mt-[12px] overflow-hidden overflow-y-auto max-h-[320px] bg-white/95 dark:bg-gray-900/95 border border-indigo-100 dark:border-blue-500/20 rounded-b-lg shadow-lg z-20 backdrop-blur-sm">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500 dark:text-blue-300/80 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user: any, idx: number) => (
              <React.Fragment key={user.id}>
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-2 p-2 hover:bg-indigo-50 dark:hover:bg-gray-800/80 transition-all duration-150 cursor-pointer group"
                  onClick={() => setSearchTerm("")}
                >
                  <div className="relative h-8 w-8">
                    <Image
                      src={
                        user.profileimages?.[0]?.image_url ||
                        user.img ||
                        "/avatar.png"
                      }
                      alt={user.name}
                      fill
                      className="object-cover rounded-full border border-indigo-100 dark:border-blue-500/30 group-hover:border-indigo-300 dark:group-hover:border-blue-400/50 transition-all"
                    />
                  </div>
                  <div className="flex flex-col dark:text-gray-100">
                    <p className="text-[15px] font-normal">{user.name}</p>
                    {user.city && (
                      <p className="text-xs text-indigo-500 dark:text-blue-400 font-normal group-hover:font-semibold group-hover:text-indigo-700 dark:group-hover:text-blue-300 leading-tight">
                        {user.city}
                      </p>
                    )}
                  </div>
                </Link>
                {idx < searchResults.length - 1 && (
                  <div className="mx-2 border-t border-indigo-50 dark:border-gray-700" />
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="p-5 text-center flex flex-col items-center">
              <div className="w-10 h-10 mb-2 rounded-full bg-indigo-100 dark:bg-blue-500/20 flex items-center justify-center">
                <FaSearch className="w-5 h-5 text-indigo-400 dark:text-blue-400" />
              </div>
              <p className="text-gray-500 dark:text-blue-300/80 text-sm">
                No users found
              </p>
              <p className="text-gray-400 dark:text-blue-300/60 text-xs mt-1">
                Try a different name or keyword.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
