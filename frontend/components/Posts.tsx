import React from "react";
import { fetchUserPosts } from "@/axios.config";
import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PostInterface } from "@/typings";

function Posts({ userId }: { userId: number }) {
  const { isPending, isError, data, error }: any = useQuery({
    queryKey: ["newPost"],
    queryFn: () => fetchUserPosts(userId),
  });

  const router = useRouter();

  if (isPending) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-gray-600/30 overflow-hidden"
          >
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
            <div className="h-64 bg-gray-100 dark:bg-gray-600"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    if (error.response?.status === 301) {
      toast.error("Session Expired! Logging In Now");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return (
        <div className="bg-gradient-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border border-white/30 dark:border-gray-600/30">
          <div className="w-12 h-12 bg-red-50/80 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-red-500 dark:text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Session Expired
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Redirecting you to login...
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gradient-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border border-white/30 dark:border-gray-600/30">
        <div className="w-12 h-12 bg-red-50/80 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-red-500 dark:text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          Error Loading Posts
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {error.message || "Please try again later"}
        </p>
      </div>
    );
  }

  // If we have no posts
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-card/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/30 dark:border-gray-600/30">
        <div className="w-16 h-16 bg-indigo-50/80 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-indigo-500 dark:text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mb-1 font-display">
          No Posts Yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          When you or your friends create posts, they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((post: PostInterface) => {
        return (
          <Post
            key={post.postid}
            postId={post.postid}
            userId={post.userid}
            profileImage={post.userprofileimage}
            name={post.username || "Unknown User"}
            caption={post.content}
            mediaUrls={post.media_urls}
            postDate={post.postdate}
            totalLikes={post.totallikes}
            totalComments={post.totalcomments}
            cu_like_status={post.cu_like_status}
          />
        );
      })}
    </div>
  );
}

export default Posts;
