"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as unlikeIcon } from "@fortawesome/free-regular-svg-icons";
import { faHeart as likeIcon } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Comments } from "./Comments";
import EditPostComponent from "./EditPost";

import { PostProps } from "@/typings";
import { API_ENDPOINT } from "@/axios.config";
import { AuthContext } from "@/app/context/AuthContext";

function Post({
  caption,
  name,
  mediaUrls,
  postDate,
  profileImage,
  postId,
  userId,
}: PostProps) {
  const { currentUser }: any = useContext(AuthContext);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [commentBox, setCommentBox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aspectRatios, setAspectRatios] = useState<string[]>([]);

  useEffect(() => {
    if (mediaUrls && mediaUrls.length > 0) {
      Promise.all(
        mediaUrls.map((url: string) => {
          return new Promise<string>((resolve) => {
            const img = new window.Image();
            img.src = url;
            img.onload = () => {
              const ratio = (img.height / img.width) * 100;
              resolve(`${ratio}%`);
            };
            img.onerror = () => {
              resolve("56.25%"); // Default 16:9 ratio
            };
          });
        })
      ).then(setAspectRatios);
    }
  }, [mediaUrls]);

  const handlePostLike = async () => {
    try {
      const endpoint = isPostLiked ? "/posts/unlike" : "/posts/like";
      await axios.post(
        `${API_ENDPOINT}${endpoint}`,
        { postId },
        { withCredentials: true }
      );
      setIsPostLiked(!isPostLiked);
    } catch (error: any) {
      console.error(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await axios.post(
          `${API_ENDPOINT}/posts/like/status`,
          { postId },
          { withCredentials: true }
        );
        setIsPostLiked(response.data);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    checkLikeStatus();
  }, [postId]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src={profileImage || "/avatar.png"}
              alt={name}
              className="rounded-full object-cover"
              fill
              sizes="40px"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500">
              {moment(postDate).fromNow()}
            </p>
          </div>
        </div>

        {userId === currentUser.id && (
          <EditPostComponent
            mediaUrls={mediaUrls}
            caption={caption}
            userId={userId}
            postId={postId}
          />
        )}
      </div>

      {/* Post Content */}
      {caption && (
        <div className="px-4 py-2">
          <p className="text-gray-700">{caption}</p>
        </div>
      )}

      {/* Post Media */}
      {mediaUrls && mediaUrls.length > 0 && aspectRatios[currentImageIndex] && (
        <div className="relative mt-2">
          <div
            className="relative w-full"
            style={{ paddingBottom: aspectRatios[currentImageIndex] }}
          >
            <Image
              src={mediaUrls[currentImageIndex]}
              alt={`Post content ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              loading="lazy"
              quality={75}
            />
          </div>
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {mediaUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? "bg-white shadow-sm"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePostLike}
            className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors"
          >
            <FontAwesomeIcon
              icon={isPostLiked ? likeIcon : unlikeIcon}
              className={`w-5 h-5 ${isPostLiked ? "text-red-500" : ""}`}
            />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button
            onClick={() => setCommentBox(!commentBox)}
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span className="text-sm font-medium">Comment</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {commentBox && (
        <div className="border-t border-gray-100">
          <Comments postId={postId} />
        </div>
      )}
    </div>
  );
}

export default Post;
