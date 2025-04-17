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

// Dynamically import ReactPhotoCollage with ssr disabled
const ReactPhotoCollage = dynamic(
  () => import("react-photo-collage").then((mod) => mod.ReactPhotoCollage),
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

  // Create collage settings based on number of images
  const getCollageConfig = () => {
    const collageImages = mediaUrls.map((url) => ({ source: url }));

    if (mediaUrls.length === 1) {
      return {
        width: "100%",
        height: ["350px"],
        layout: [1],
        photos: collageImages,
        showNumOfRemainingPhotos: false,
      };
    } else if (mediaUrls.length === 2) {
      return {
        width: "100%",
        height: ["250px"],
        layout: [2],
        photos: collageImages,
        showNumOfRemainingPhotos: false,
      };
    } else if (mediaUrls.length === 3) {
      return {
        width: "100%",
        height: ["250px"],
        layout: [3],
        photos: collageImages,
        showNumOfRemainingPhotos: false,
      };
    } else if (mediaUrls.length === 4) {
      return {
        width: "100%",
        height: ["175px", "175px"],
        layout: [2, 2],
        photos: collageImages.slice(0, 4),
        showNumOfRemainingPhotos: false,
      };
    } else {
      // More than 4 images
      return {
        width: "100%",
        height: ["200px", "120px"],
        layout: [1, 3],
        photos: collageImages.slice(0, 4),
        showNumOfRemainingPhotos: true,
      };
    }
  };

  // Handle click on collage to open photo viewer
  const handleCollageClick = (index: number) => {
    // Find and click the PhotoView element
    setTimeout(() => {
      const photoViewElements = document.querySelectorAll(
        `.post-${postId} .PhotoView-Slider__PhotoBox`
      );
      if (photoViewElements && photoViewElements[index]) {
        (photoViewElements[index] as HTMLElement).click();
      }
    }, 10);
  };

  // Render a simple placeholder for SSR
  const renderPlaceholder = () => {
    if (mediaUrls.length === 1) {
      return <div className="w-full h-[350px] bg-gray-100"></div>;
    } else if (mediaUrls.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1">
          <div className="h-[250px] bg-gray-100"></div>
          <div className="h-[250px] bg-gray-100"></div>
        </div>
      );
    } else if (mediaUrls.length === 3) {
      return (
        <div className="grid grid-cols-3 gap-1">
          <div className="h-[250px] bg-gray-100"></div>
          <div className="h-[250px] bg-gray-100"></div>
          <div className="h-[250px] bg-gray-100"></div>
        </div>
      );
    } else {
      return <div className="w-full h-[300px] bg-gray-100"></div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 border border-gray-100">
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
      {mediaUrls.length > 0 && (
        <div
          className={`media-container w-full overflow-hidden post-${postId}`}
        >
          {isMounted ? (
            <div className="relative">
              {/* Photo Collage - Only rendered client-side */}
              <div
                className="cursor-pointer"
                onClick={() => handleCollageClick(0)}
              >
                {isMounted && <ReactPhotoCollage {...getCollageConfig()} />}
              </div>

              {/* Hidden Photo Provider */}
              <PhotoProvider>
                {mediaUrls.map((url, index) => (
                  <PhotoView key={index} src={url}>
                    <div style={{ display: "none" }} />
                  </PhotoView>
                ))}
              </PhotoProvider>
            </div>
          ) : (
            // Simple placeholder for SSR
            renderPlaceholder()
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
