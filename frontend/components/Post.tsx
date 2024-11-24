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
  mediaUrl,
  postDate,
  profileImage,
  postId,
  userId,
}: PostProps) {
  const { currentUser }: any = useContext(AuthContext);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [commentBox, setCommentBox] = useState(false);

  const [aspectRatio, setAspectRatio] = useState("56.25%"); // Default 16:9

  useEffect(() => {
    if (mediaUrl) {
      const img = new window.Image();
      img.src = mediaUrl;
      img.onload = () => {
        const ratio = (img.height / img.width) * 100;
        setAspectRatio(`${ratio}%`);
      };
      img.onerror = () => {
        console.error("Failed to load mediaUrl for aspect ratio calculation.");
        setAspectRatio("56.25%");
      };
    }
  }, [mediaUrl]);

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

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newFile = e.target.files?.[0];
  //   if (!newFile) return;
  //   const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  //   if (!allowedTypes.includes(newFile.type)) {
  //     return toast.error("Invalid file type. Please upload an image.");
  //   }
  //   if (newFile.size > 5 * 1024 * 1024) {
  //     return toast.error("File size exceeds 5MB.");
  //   }
  //   setFile(newFile);
  //   setPreviewUrl(URL.createObjectURL(newFile));
  // };

  return (
    <div className="flex flex-col w-full rounded-md shadow-lg bg-slate-50">
      <div className="w-full flex pr-4 pt-4 p-2">
        <div className="flex gap-2 w-full">
          <div className="relative w-10 h-10">
            <Image
              src={profileImage || "/avatar.png"}
              alt="Profile pic"
              className="rounded-full shadow-lg object-cover"
              fill
              sizes="40px"
            />
          </div>
          <div className="flex flex-col">
            <h6 className="text-[14px]">{name}</h6>
            <span className="text-[10px] text-muted-foreground">
              {moment(postDate).fromNow()}
            </span>
          </div>
        </div>

        {userId === currentUser.id && (
          <EditPostComponent
            mediaUrl={mediaUrl}
            caption={caption}
            currentUser={currentUser}
            userId={userId}
          />
        )}
      </div>

      <div className="relative">
        <div className="text-sm p-2">{caption}</div>
        <div className="relative w-full" style={{ paddingBottom: aspectRatio }}>
          <Image
            src={mediaUrl}
            alt="Post content"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority={false}
            unoptimized={true}
          />
        </div>
      </div>

      <div className="flex p-2 gap-2">
        <Button variant="ghost" onClick={handlePostLike}>
          <FontAwesomeIcon
            icon={isPostLiked ? likeIcon : unlikeIcon}
            color={isPostLiked ? "red" : undefined}
          />
        </Button>
        <Button variant="ghost" onClick={() => setCommentBox(!commentBox)}>
          Comments
        </Button>
      </div>

      {commentBox && <Comments postId={postId} />}
    </div>
  );
}

export default Post;
