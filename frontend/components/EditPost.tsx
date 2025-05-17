import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Progress } from "./ui/progress";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

import { removeThisImage } from "@/axios.config";

import { IoEllipsisVertical } from "react-icons/io5";
import { EditPost, EditPostProps, MediaItem, UploadResponse } from "@/typings";
import axios from "axios";
import { Button } from "./ui/button";
import Image from "next/image";

import { useEditPostMutation } from "@/lib/mutations";
import { useFileUploader } from "@/hooks/useFileUploader";

export const EditPostComponent = ({
  caption,
  mediaUrls,
  onSuccess,
  onError,
  postId,
}: EditPostProps) => {
  // Edit Post Modal Handler
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  // File & Form Handler
  const [files, setFiles] = useState<FileList | null>(null);
  const [desc, setDesc] = useState<string>(caption);
  const [previewUrls, setPreviewUrls] = useState<Array<string | MediaItem>>(mediaUrls);
  const [newPreviewUrls, setNewPreviewUrls] = useState<Array<string | MediaItem>>(mediaUrls);
  const formRef = useRef<HTMLFormElement>(null);
  const addMediaInput = useRef<HTMLInputElement>(null);

  // Loader
  // const [uploadState, setUploadState] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { uploadFiles, isUploading, progress, error } = useFileUploader();

  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
  };

  const mutation = useEditPostMutation(postId);

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      const postData = { desc, imgUrls: "" };
      mutation.mutate(postData as EditPost);
      if (removedImages.length > 0) removeThisImage(postId, removedImages);
      closeButton.current?.click();
      return toast.success("Post Updated");
    }

    try {
      const uploadedFiles = await uploadFiles(files);
      const downloadURLs = uploadedFiles.map(file => file.url);

      const postData = {
        desc,
        imgUrls: JSON.stringify(downloadURLs.flat()),
      };

      mutation.mutate(postData as EditPost);
      closeButton.current?.click();
      clearFileInput();
    } catch (err) {
      console.error("Error uploading files:", err);
      toast.error("Failed to upload files. Please try again.");
    }
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const selectedFiles = e.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select files");
      return;
    }

    const arrayOfFileList = Array.from(selectedFiles);

    // Validate file types and sizes
    const validFileTypes = ["image/jpeg", "image/png"];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const invalidFiles = arrayOfFileList.filter(
      (file) => !validFileTypes.includes(file.type) || file.size > maxFileSize
    );

    if (invalidFiles.length > 0) {
      toast.error(
        "Some files are invalid. Please only upload images under 5MB."
      );
      return;
    }

    setFiles(selectedFiles);

    // Create and add new preview URLs
    const newPreviewUrls = arrayOfFileList.map((file) =>
      URL.createObjectURL(file)
    );

    // Update preview URLs while maintaining the existing ones
    setPreviewUrls((prev) => {
      // If we already have preview URLs, add the new ones
      if (prev.length > 0) {
        return [...prev, ...newPreviewUrls];
      }
      // If no existing preview URLs, just use the new ones
      return newPreviewUrls;
    });

    // Clean up old preview URLs when component unmounts
    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  };

  /**
   * Clears the file input and resets related states
   *
   * Actions:
   * - Resets files state to null
   * - Clears preview URLs array
   * - Resets file input element value
   * - Cleans up object URLs to prevent memory leaks
   */
  const clearFileInput = () => {
    setFiles(null);
    setPreviewUrls([]);

    if (formRef.current) {
      const fileInput = formRef.current.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleAddMedia = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addMediaInput.current?.click();
  };

  const clearImage = (media: string | MediaItem) => {
    const mediaUrl = typeof media === 'string' ? media : media.url;
    
    // check if existing media is deleted
    const mediaExists = previewUrls.some(url => 
      (typeof url === 'string' ? url : url.url) === mediaUrl
    );
    
    if (mediaExists) {
      const newPreviewUrls = previewUrls.filter(url => 
        (typeof url === 'string' ? url : url.url) !== mediaUrl
      );
      setPreviewUrls(newPreviewUrls);
      setRemovedImages((prev) => [...prev, mediaUrl]);
    }

    // check if new media is deleted
    const newMediaExists = newPreviewUrls.some(url => 
      (typeof url === 'string' ? url : url.url) === mediaUrl
    );
    
    if (newMediaExists) {
      console.log("Found In new preview URL");
    }
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <IoEllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              setIsModalOpen(true);
              setIsDropdownOpen(false);
            }}
          >
            Edit Post
          </DropdownMenuItem>
          <DropdownMenuItem>Report</DropdownMenuItem>
          <DropdownMenuItem>Unfollow</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <form ref={formRef} onSubmit={handleUploadPost}>
            <DialogTitle>Edit Post</DialogTitle>
            <textarea
              rows={3}
              value={desc}
              placeholder="What's on your mind?"
              className="border-none outline-none w-full"
              onChange={(e) => setDesc(e.target.value)}
            />
            <input
              ref={addMediaInput}
              className={"hidden"}
              type="file"
              accept="image/*"
              onChange={handleMultipleFiles}
              multiple={true}
            />

            {previewUrls.length > 0 && (
              <div className="h-[400px] overflow-auto mb-5">
                {previewUrls.map((mediaItem) => {
                  const mediaUrl = typeof mediaItem === 'string' ? mediaItem : mediaItem.url;
                  const isVideo = typeof mediaItem !== 'string' && mediaItem.type === 'video';
                  
                  return (
                    <div key={mediaUrl} className="relative w-full mt-4">
                      {isVideo ? (
                        <video
                          src={mediaUrl}
                          controls
                          className="w-full rounded-md"
                        />
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt="preview-image"
                          width={100}
                          height={100}
                          unoptimized={true}
                          className="w-full rounded-md"
                        />
                      )}
                      <div
                        className="absolute p-2 bg-white rounded-full right-2 top-2 cursor-pointer"
                        onClick={() => clearImage(mediaItem)}
                      >
                        X
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {isUploading && (
              <div className="w-full flex flex-col justify-center">
                <span className="text-center font-medium">
                  Post is Uploading...
                </span>
                <div className="flex items-center gap-1">
                  <Progress value={progress} />
                  <span className="font-semibold text-sm">
                    {Math.round(progress || 0)}%
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={(e) => handleAddMedia(e)}>Add Media</Button>
              <DialogClose asChild>
                <Button ref={closeButton} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditPostComponent;
