"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BsMessenger, BsGrid3X3, BsBookmark } from "react-icons/bs";
import { FaRegHeart, FaRegBookmark, FaLink } from "react-icons/fa";
import { IoMdPhotos, IoMdPeople } from "react-icons/io";
import { RiUserFollowLine } from "react-icons/ri";
import { useFollowed } from "@/hooks/isFriend";
import Posts from "@/components/Posts";
import { BACKEND_API } from "@/axios.config";

function Page() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const route = useRouter();
  const { isFollowed, setIsFollowed } = useFollowed(Number(id));
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await BACKEND_API.post(
          `/search/profile`,
          { id },
          { withCredentials: true }
        );
        if (response.status === 204) {
          setError("User Not Found");
        }
        if (response.status === 200) {
          setUser(response.data.userData);
          setPosts(response.data.userPost || []);
        }
      } catch (err: any) {
        if (err.response?.status === 301) {
          route.push("/");
        } else {
          setError("Failed to load profile");
          console.error("Error fetching profile:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
  }, [id, route]);

  const handleFollow = async () => {
    setIsFollowed(true);
    try {
      const res = await BACKEND_API.post(
        `/user/follow`,
        {
          friendId: id,
        },
        { withCredentials: true }
      );
      if (res.status !== 200) {
        setIsFollowed(false);
      }
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnFollow = async () => {
    setIsFollowed(false);
    try {
      const res = await BACKEND_API.post(
        `/user/unfollow`,
        {
          friendId: id,
        },
        { withCredentials: true }
      );

      if (res.status !== 200) {
        setIsFollowed(true);
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => route.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <Button onClick={() => route.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-6">
              <div className="relative w-32 h-32">
                <Image
                  src={user.img || "/avatar.png"}
                  alt="Profile pic"
                  className="rounded-full border-4 border-white shadow-xl object-cover"
                  fill
                  sizes="128px"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <p className="text-white/80 mb-4">
                  @{user.name?.toLowerCase().replace(/\s+/g, "")}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <IoMdPeople className="w-5 h-5" />
                    <span>{Array.isArray(posts) ? posts.length : 0} Posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiUserFollowLine className="w-5 h-5" />
                    <span>0 Followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiUserFollowLine className="w-5 h-5" />
                    <span>0 Following</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isFollowed ? (
                <Button
                  onClick={handleUnFollow}
                  className="bg-white/40 hover:bg-white/50/30 backdrop-blur-sm text-white border border-white/20"
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  className="bg-white/50 text-indigo-600 hover:bg-white/50/90"
                >
                  Follow
                </Button>
              )}

              <Button
                variant="outline"
                className="bg-white/40 hover:bg-white/50/30 backdrop-blur-sm text-white border border-white/20"
              >
                <BsMessenger className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Bio & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600 mb-6">
              {user.bio || "No bio available"}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaLink className="w-5 h-5 text-gray-400" />
                <a href="#" className="text-indigo-600 hover:underline">
                  Add website
                </a>
              </div>
              <div className="flex items-center gap-3">
                <IoMdPhotos className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Joined {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
              >
                💻 Coding
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"
              >
                🚅 Traveling
              </Badge>
              <Badge
                variant="outline"
                className="bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100"
              >
                🎶 Music
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
              >
                🕹️ Video Games
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column - Posts */}
        <div className="lg:col-span-2">
          <div className="bg-white/50 rounded-2xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                    activeTab === "posts"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <BsGrid3X3 className="w-5 h-5" />
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab("liked")}
                  className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                    activeTab === "liked"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaRegHeart className="w-5 h-5" />
                  Liked
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                    activeTab === "saved"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <BsBookmark className="w-5 h-5" />
                  Saved
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "posts" && <Posts userId={Number(id)} />}
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
      </div>
    </div>
  );
}

export default Page;
