"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { API_ENDPOINT } from "@/axios.config";
import Post from "@/components/Post";
import { PostProps } from "@/typings";

interface HashtagData {
  hashtag: {
    name: string;
    post_count: number;
  };
  posts: PostProps[];
}

export default function HashtagPage() {
  const params = useParams();
  const tagName = params.tagName as string;

  const [data, setData] = useState<HashtagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_ENDPOINT}/hashtags/hashtag/${tagName}`,
          { withCredentials: true }
        );
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching hashtag posts:", err);
        setError(err.response?.data?.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    if (tagName) {
      fetchHashtagPosts();
    }
  }, [tagName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Oops!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Hashtag Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">#</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              #{data?.hashtag.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {data?.hashtag.post_count || 0} posts
            </p>
          </div>
        </div>
      </div>

      {/* Posts */}
      {data?.posts && data.posts.length > 0 ? (
        <div className="space-y-4">
          {data.posts.map((post: any) => (
            <Post
              key={post.postid}
              postId={post.postid}
              caption={post.content}
              name={post.username}
              mediaUrls={post.media_urls}
              postDate={post.postdate}
              profileImage={post.userprofileimage}
              userId={post.userid}
              totalLikes={post.totallikes}
              totalComments={post.totalcomments}
              cu_like_status={post.cu_like_status}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No posts found with this hashtag yet.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Be the first to use #{data?.hashtag.name}!
          </p>
        </div>
      )}
    </div>
  );
}
