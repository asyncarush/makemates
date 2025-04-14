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
      <div className="w-[280px] flex-shrink-0 sticky top-[100px] h-fit">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400" />
          <div className="px-4 pb-4 -mt-10">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <Image
                src={currentUser?.img || "/avatar.png"}
                className="rounded-full border-4 border-white shadow-md object-cover"
                alt="Profile pic"
                fill
                sizes="64px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                {currentUser?.name || "User"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                @{currentUser?.name?.toLowerCase().replace(/\s+/g, "")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-xl shadow-sm mt-6 p-4">
          <nav className="space-y-1">
            <Link
              href="/chat"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg group transition-all duration-200"
            >
              <BsMessenger className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Messages</span>
            </Link>
            <Link
              href="/profile/liked"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg group transition-all duration-200"
            >
              <svg
                className="w-5 h-5 text-pink-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              <span className="font-medium">Liked Posts</span>
            </Link>
            <Link
              href="/profile/saved"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg group transition-all duration-200"
            >
              <svg
                className="w-5 h-5 text-yellow-500"
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
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Following</h4>
          <div className="space-y-2">
            {friendsList.length > 0 ? (
              friendsList.map((friend: any) => (
                <HoverCard key={`${friend.follow_id}-${friend.follower_id}`}>
                  <HoverCardTrigger asChild>
                    <Link
                      href={`/profile/${friend.follow_id}`}
                      className="flex items-center gap-3 p-2 hover:bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg transition-all duration-200"
                    >
                      <div className="relative w-10 h-10">
                        <Image
                          src={friend.profileImage || "/avatar.png"}
                          alt={friend.name}
                          className="rounded-full object-cover"
                          fill
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.name}
                        </p>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={friend.profileImage || "/avatar.png"}
                          alt={friend.name}
                          className="rounded-full object-cover"
                          fill
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {friend.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Last seen recently
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUser className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-gray-500">No followers yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start connecting with others!
                </p>
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
