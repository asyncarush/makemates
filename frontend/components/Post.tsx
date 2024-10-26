"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IoEllipsisVertical } from "react-icons/io5";
import { AuthContext } from "@/app/context/AuthContext";
import Image from "next/image";
import { API_ENDPOINT } from "@/axios.config";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as unlikeIcon } from "@fortawesome/free-regular-svg-icons";
import { faHeart as likeIcon } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Comments } from "./Comments";

interface PostProps {
  caption: string;
  mediaUrl: string;
  postDate: string;
  name: string;
  profileImage: string | null;
  postId: number;
  userId: number;
}

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
  const [postCaption, setPostCaption] = useState(caption);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("56.25%"); // Default 16:9

  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new window.Image();
      img.src = mediaUrl;
      img.onload = () => {
        const ratio = (img.height / img.width) * 100;
        setAspectRatio(`${ratio}%`);
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
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    const checkLikeStatus = async () => {
      const response = await axios.post(
        `${API_ENDPOINT}/posts/like/status`,
        { postId },
        { withCredentials: true }
      );
      setIsPostLiked(response.data);
    };
    checkLikeStatus();
  }, [postId]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col w-full rounded-md shadow-lg bg-slate-50">
      <div className="w-full flex pr-4 pt-4 p-2">
        <div className="flex gap-2 w-full">
          <div className="relative w-10 h-10">
            <Image
              src={profileImage || "/avatar.png"}
              className="rounded-full shadow-lg object-cover"
              alt="Profile pic"
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

        <div className="border-none outline-none">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IoEllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {userId === currentUser.id && (
                <DropdownMenuItem
                  onSelect={() => {
                    setIsModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Edit Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Unfollow</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px] h-[500px]">
          <DialogHeader>
            <DialogTitle>Edit the Post</DialogTitle>
            <DialogDescription className="">
              <textarea
                value={postCaption}
                onChange={(e) => setPostCaption(e.currentTarget.value)}
                className="w-full mt-2 p-2 border rounded-md"
              />
              <div className="h-[300px] overflow-y-auto">
                {mediaUrl && (
                  <div className="relative w-full h-auto">
                    <Image
                      src={mediaUrl}
                      alt="Post content"
                      width={0} // Width set to 100% of the parent container
                      height={0} // Allows height to scale with aspect ratio
                      className="w-full h-auto object-contain" // Ensures proper scaling
                      // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      priority={false}
                      unoptimized={true}
                    />
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleModalClose}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Post;
