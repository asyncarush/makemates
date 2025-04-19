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

// Dynamically import PhotoProvider and PhotoView with ssr disabled
const PhotoProvider = dynamic(
  () => import("react-photo-view").then((mod) => mod.PhotoProvider),
  { ssr: false }
);

const PhotoView = dynamic(
  () => import("react-photo-view").then((mod) => mod.PhotoView),
  { ssr: false }
);

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Get grid layout based on number of images
  const getGridLayout = () => {
    if (mediaUrls.length === 1) return "grid-cols-1";
    if (mediaUrls.length === 2) return "grid-cols-2";
    if (mediaUrls.length === 3) return "grid-cols-3";
    if (mediaUrls.length === 4) return "grid-cols-2 grid-rows-2";
    return "grid-template-gallery"; // Custom class for 5+ images
  };

  // Limit the number of images shown in the grid
  const getVisibleMediaUrls = () => {
    if (mediaUrls.length <= 5) return mediaUrls;
    return mediaUrls.slice(0, 5);
  };

  // Get specific classes for each image position in the grid
  const getImageClasses = (index: number, totalImages: number) => {
    if (totalImages === 1) return "col-span-full row-span-full aspect-[16/9]";

    if (totalImages === 2) return "aspect-square";

    if (totalImages === 3) return "aspect-square";

    if (totalImages === 4) {
      return "aspect-square";
    }

    if (totalImages >= 5) {
      if (index === 0) return "gallery-item-0";
      if (index === 1) return "gallery-item-1";
      if (index === 2) return "gallery-item-2";
      if (index === 3) return "gallery-item-3";
      if (index === 4) return "gallery-item-4";
    }

    return "aspect-square";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
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
        <div className="px-3 py-1.5">
          <p className="text-gray-700 text-sm">{caption}</p>
        </div>
      )}

      {/* Post Media */}
      {mediaUrls.length > 0 && (
        <div className="media-container w-full overflow-hidden">
          {isMounted && (
            <PhotoProvider photoClosable>
              <div
                className={`grid ${getGridLayout()} gap-0.5`}
                style={{
                  // Custom grid for 5+ images matching the screenshot
                  ...(mediaUrls.length >= 5
                    ? {
                        display: "grid",
                        gridTemplateAreas: `
                      "img0 img0 img2"
                      "img1 img3 img4"
                    `,
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gridTemplateRows:
                          "minmax(150px, 200px) minmax(150px, 200px)",
                        maxHeight: "400px",
                      }
                    : {}),
                }}
              >
                {getVisibleMediaUrls().map((url, index) => {
                  const imageClasses = getImageClasses(index, mediaUrls.length);
                  return (
                    <div
                      key={`${url}-${index}`}
                      className={`relative overflow-hidden ${imageClasses}`}
                      style={{
                        ...(mediaUrls.length >= 5
                          ? {
                              gridArea: `img${index}`,
                            }
                          : {}),
                      }}
                    >
                      <PhotoView src={url}>
                        <div className="w-full h-full cursor-pointer hover:opacity-95 transition-opacity relative">
                          <Image
                            src={url}
                            alt={caption || `Photo ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                      </PhotoView>

                      {/* Show remaining count on last visible image */}
                      {mediaUrls.length > 5 && index === 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all">
                          <span className="text-white text-xl font-medium">
                            +{mediaUrls.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </PhotoProvider>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePostLike}
            className="flex items-center gap-1.5 text-gray-700 hover:text-red-500 transition-colors"
          >
            <FontAwesomeIcon
              icon={isPostLiked ? likeIcon : unlikeIcon}
              className={`w-4 h-4 ${isPostLiked ? "text-red-500" : ""}`}
            />
            <span className="text-xs font-medium">Like</span>
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
          </button>
        </div>
      </div>

      {/* Comments */}
      {commentBox && (
        <div className="border-t border-gray-100 px-3 py-2">
          <Comments postId={postId} />
        </div>
      )}
    </div>
  );
}

export default Post;
