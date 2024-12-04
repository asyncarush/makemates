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
    <div className="relative">
      <div className="flex items-center gap-2 border px-2 py-1 rounded-full bg-white/20">
        <FaSearch className="text-white/60" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-white w-[200px]"
        />
      </div>

      {searchTerm.trim() && (
        <div className="absolute w-[400px] overflow-hidden overflow-y-auto max-h-[400px] text-black flex flex-col mt-2 rounded-md bg-white/90 drop-shadow-2xl">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user: any) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors"
                onClick={() => setSearchTerm("")}
              >
                <div className="relative h-10 w-10">
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
                  <p className="font-medium">{user.name}</p>
                  {user.city && (
                    <p className="text-sm text-gray-500">{user.city}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
