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
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full focus-within:bg-white/20 focus-within:border-white/30 transition-all duration-200">
        <FaSearch className="w-4 h-4 text-white/70" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none text-white placeholder-white/70"
        />
      </div>

      {searchTerm.trim() && (
        <div className="absolute w-full mt-2 overflow-hidden overflow-y-auto max-h-[400px] rounded-xl bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/5">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user: any) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                onClick={() => setSearchTerm("")}
              >
                <div className="relative h-10 w-10 ring-2 ring-white ring-offset-2">
                  <Image
                    src={
                      user.profileimages?.[0]?.image_url ||
                      user.img ||
                      "/avatar.png"
                    }
                    alt={user.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  {user.city && (
                    <p className="text-sm text-indigo-600">{user.city}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
                <FaSearch className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
