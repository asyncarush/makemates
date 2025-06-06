"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import moment from "moment";
import dynamic from "next/dynamic";
import "react-photo-view/dist/react-photo-view.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as unlikeIcon } from "@fortawesome/free-regular-svg-icons";
import { faHeart as likeIcon } from "@fortawesome/free-solid-svg-icons";

import { Comments } from "./Comments";
import EditPostComponent from "./EditPost";

import { PostProps } from "@/typings";
import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";
import RenderMedia from "./RenderMedia";

function Post({
  caption,
  name,
  mediaUrls: rawMediaUrls,
  postDate,
  profileImage,
  postId,
  userId,
  totalLikes,
  totalComments,
  cu_like_status,
}: PostProps) {
  const { currentUser }: any = useContext(AuthContext);
  const [isPostLiked, setIsPostLiked] = useState(Boolean(cu_like_status));
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [commentBox, setCommentBox] = useState(false);
  const [currentTotalLikes, setCurrentTotalLikes] = useState(totalLikes);
  const [currentTotalComments, setCurrentTotalComments] =
    useState(totalComments);

  const handlePostLike = async () => {
    try {
      // Update UI immediately
      setIsPostLiked((prev) => !prev);
      setCurrentTotalLikes((prev) => (isPostLiked ? prev - 1 : prev + 1));
      setLikeAnimating(true);

      // Make API call
      const endpoint = isPostLiked ? "/posts/unlike" : "/posts/like";
      await axios.post(
        `${API_ENDPOINT}${endpoint}`,
        { postId },
        { withCredentials: true }
      );
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      // If API call fails, revert UI changes
      setIsPostLiked((prev) => !prev);
      setCurrentTotalLikes((prev) => (isPostLiked ? prev + 1 : prev - 1));
    } finally {
      setLikeAnimating(false);
    }
  };
  return (
    <div className="bg-white/40  shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <Image
              src={profileImage || "/avatar.png"}
              alt={name}
              className="rounded-full object-cover ring-1 ring-gray-100"
              fill
              sizes="32px"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-800 text-sm font-display">
              {name}
            </h3>
            <p className="text-xs text-gray-500">
              {moment(postDate).fromNow()}
            </p>
          </div>
        </div>

        {userId === currentUser?.id && (
          <EditPostComponent
            mediaUrls={rawMediaUrls}
            caption={caption}
            userId={userId}
            postId={postId}
          />
        )}
      </div>

      {/* Post Content */}
      {caption && (
        <div className="px-3 py-1.5">
          <p className="text-gray-700 text-sm">{caption}</p>
        </div>
      )}

      {/* Media Content */}
      {rawMediaUrls &&
        rawMediaUrls.length > 0 &&
        rawMediaUrls[0] !== null &&
        rawMediaUrls[0] !== undefined && (
          <div className="relative w-full h-full">
            <RenderMedia mediaUrls={rawMediaUrls} />
          </div>
        )}

      {/* Post Actions */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePostLike}
            className="flex items-cenxter gap-1.5 text-gray-700 hover:text-red-500 transition-colors duration-1000"
          >
            <FontAwesomeIcon
              icon={isPostLiked ? likeIcon : unlikeIcon}
              className={`w-4 h-4 ${isPostLiked ? "text-red-500" : ""} ${
                likeAnimating ? "like-animate" : ""
              }`}
              onAnimationEnd={() => setLikeAnimating(false)}
            />
            <span className="text-xs font-medium">Like</span>
            {currentTotalLikes > 0 && (
              <span className="text-xs font-medium ml-1">
                {currentTotalLikes}
              </span>
            )}
          </button>
          <button
            onClick={() => setCommentBox(!commentBox)}
            className="flex items-center gap-1.5 text-gray-700 hover:text-indigo-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span className="text-xs font-medium">Comment</span>
            {totalComments > 0 && (
              <span className="text-xs font-medium ml-1">{totalComments}</span>
            )}
          </button>
        </div>
      </div>

      {/* Comments */}
      {commentBox && (
        <div className="border-t border-gray-100 px-3 py-2">
          <Comments
            postId={postId}
            onCommentAdded={() => setCurrentTotalComments((prev) => prev + 1)}
            onCommentRemoved={() => setCurrentTotalComments((prev) => prev - 1)}
          />
        </div>
      )}
    </div>
  );
}

export default Post;
