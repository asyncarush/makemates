"use client";

import React, { useContext, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

import { BsMessenger } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import useFriendList from "@/hooks/useFriendList";
import Posts from "@/components/Posts";

function Page() {
  const friendsList = useFriendList();

  const { currentUser, setCurrentUser }: any = useContext(AuthContext);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await axios.get(`${API_ENDPOINT}/user/me`, {
        withCredentials: true,
      });
      window.localStorage.setItem("currentUser", JSON.stringify(data));
      setCurrentUser(data);
    };

    getUserData();
  }, [setCurrentUser]);

  useEffect(() => {
    if (currentUser && currentUser.name) {
      const firstName = currentUser.name.split(" ")[0];
      document.title = firstName + "'s feed";
    } else {
      document.title = "Feed";
    }
  }, [currentUser]);

  return currentUser ? (
    <div className="flex gap-8 max-w-7xl mx-auto">
      {/* Left Sidebar */}
      <div className="w-[260px] flex-shrink-0 sticky top-[100px] h-fit">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400" />
          <div className="px-3 pb-3 -mt-8">
            <div className="relative w-12 h-12 mx-auto mb-2">
              <Image
                src={currentUser?.img || "/avatar.png"}
                className="rounded-full border-2 border-white shadow-sm object-cover"
                alt="Profile pic"
                fill
                sizes="48px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-900 text-sm">
                {currentUser?.name || "User"}
              </h3>
              <p className="text-xs text-gray-500">
                @{currentUser?.name?.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-xl shadow-sm mt-3 p-2">
          <nav className="space-y-0.5">
            <Link
              href="/chat"
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md group transition-all duration-200 text-sm"
            >
              <BsMessenger className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Messages</span>
            </Link>
            <Link
              href="/profile/liked"
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md group transition-all duration-200 text-sm"
            >
              <svg
                className="w-4 h-4 text-pink-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              <span className="font-medium">Liked Posts</span>
            </Link>
            <Link
              href="/profile/saved"
              className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md group transition-all duration-200 text-sm"
            >
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <span className="font-medium">Saved Posts</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1 max-w-2xl">
        <Posts userId={currentUser?.id} />
      </div>

      {/* Right Sidebar - Following */}
      <div className="w-[280px] flex-shrink-0 sticky top-[100px] h-fit">
        <div className="bg-white backdrop-blur-sm bg-opacity-95 rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800 flex items-center gap-1.5 text-sm">
              <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
              Following
            </h4>
            {friendsList.length > 0 && (
              <span className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-1.5 py-0.5">
                {friendsList.length}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {friendsList.length > 0 ? (
              friendsList.map((friend: any) => (
                <HoverCard key={`${friend.follow_id}-${friend.follower_id}`}>
                  <HoverCardTrigger asChild>
                    <Link
                      href={`/profile/${friend.follow_id}`}
                      className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-md transition-all duration-200 group"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white">
                        <Image
                          src={friend.profileImage || "/avatar.png"}
                          alt={friend.name}
                          className="rounded-full object-cover group-hover:scale-105 transition-transform"
                          fill
                          sizes="32px"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors text-sm">
                          {friend.name}
                        </p>
                        <div className="flex items-center">
                          <span className="h-1 w-1 rounded-full bg-green-500 mr-1"></span>
                          <p className="text-xs text-gray-500">Online</p>
                        </div>
                      </div>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72 p-0 overflow-hidden rounded-xl border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 h-16" />
                    <div className="p-3 -mt-8">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                          <Image
                            src={friend.profileImage || "/avatar.png"}
                            alt={friend.name}
                            className="rounded-full object-cover"
                            fill
                            sizes="48px"
                          />
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {friend.name}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center">
                            <span className="h-1 w-1 rounded-full bg-green-500 mr-1"></span>
                            Online now
                          </p>
                        </div>
                      </div>
                      <div className="flex mt-3 pt-2 border-t border-gray-100">
                        <Link
                          href={`/chat/${friend.follow_id}`}
                          className="flex-1 flex items-center justify-center py-1.5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <BsMessenger className="w-3 h-3 mr-1" />
                          Message
                        </Link>
                        <Link
                          href={`/profile/${friend.follow_id}`}
                          className="flex-1 flex items-center justify-center py-1.5 ml-2 rounded-md bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors"
                        >
                          <FaUser className="w-3 h-3 mr-1" />
                          Profile
                        </Link>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            ) : (
              <div className="text-center py-4 px-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUser className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-gray-700 font-medium text-sm">
                  No connections yet
                </p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-[180px] mx-auto">
                  Find friends to see them appear here
                </p>
                <button className="mt-3 text-xs text-indigo-600 font-medium border border-indigo-100 rounded-md px-3 py-1.5 hover:bg-indigo-50 transition-colors">
                  Find people
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500">Loading...</span>
      </div>
    </div>
  );
}

export default Page;
