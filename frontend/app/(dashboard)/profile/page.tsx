"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { BsMessenger, BsThreeDots } from "react-icons/bs";
import { FaUser, FaRegHeart, FaRegBookmark } from "react-icons/fa";
import { IoMdPhotos } from "react-icons/io";

import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import Posts from "@/components/Posts";

function ProfilePage() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`${API_ENDPOINT}/user/${id}`, {
          withCredentials: true,
        });
        setProfileUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 relative">
          <div className="absolute bottom-4 right-4">
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              <BsThreeDots className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 -mt-16">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="relative w-32 h-32">
                <Image
                  src={profileUser?.img || "/avatar.png"}
                  alt="Profile pic"
                  className="rounded-full border-4 border-white shadow-md object-cover"
                  fill
                  sizes="128px"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser?.name}
                </h1>
                <p className="text-gray-500">
                  @{profileUser?.name?.toLowerCase().replace(/\s+/g, "")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Follow
              </button>
              <Link
                href="/chat"
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BsMessenger className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <p className="text-gray-700">
              {profileUser?.bio || "No bio available"}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center gap-8">
            <div className="flex items-center gap-2">
              <IoMdPhotos className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                <span className="font-semibold">0</span> Posts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                <span className="font-semibold">0</span> Followers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                <span className="font-semibold">0</span> Following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-6 bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "posts"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("liked")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "liked"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Liked
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "saved"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Saved
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "posts" && <Posts userId={profileUser?.id} />}
          {activeTab === "liked" && (
            <div className="text-center py-12">
              <FaRegHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No liked posts yet</p>
            </div>
          )}
          {activeTab === "saved" && (
            <div className="text-center py-12">
              <FaRegBookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
