import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

import { API_ENDPOINT } from "@/axios.config";

import { IoEllipsisVertical } from "react-icons/io5";
import { EditPost, EditPostProps, UploadResponse } from "@/typings";
import axios from "axios";
import { Button } from "./ui/button";
import Image from "next/image";

export const EditPostComponent = ({
  caption,
  mediaUrls,
  onSuccess,
  onError,
  postId,
}: EditPostProps) => {
  const queryclient = useQueryClient();

  // Edit Post Modal Handler
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  // File & Form Handler
  const [files, setFiles] = useState<FileList | null>(null);
  const [desc, setDesc] = useState<string>(caption);
  const [previewUrls, setPreviewUrls] = useState<string[]>(mediaUrls);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>(mediaUrls);
  const formRef = useRef<HTMLFormElement>(null);
  const addMediaInput = useRef<HTMLInputElement>(null);

  // Loader
  const [uploadState, setUploadState] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
  };

  const mutation = useMutation<EditPost, Error, EditPost>({
    mutationFn: async (newPost: EditPost) => {
      const response = await axios.post<EditPost>(
        `${API_ENDPOINT}/posts/edit/${postId}`,
        {
          desc: newPost.desc,
          imgUrls: newPost.imgUrls,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["newPost"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Post creation failed:", error);
      onError?.(error);
    },
  });

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      const postData = {
        desc,
        imgUrls: "",
      };
      mutation.mutate(postData as EditPost);
      closeButton.current?.click();
      return toast.success("Post Updated");
    }

    try {
      console.log("Editing Selected File,", files);

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const formData = new FormData();
        formData.append("post_images", file, fileName);

        try {
          setUploadState(true);

          const response = await axios.post<UploadResponse>(
            `${API_ENDPOINT}/upload`,
            formData,
            {
              withCredentials: true,
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const progress =
                    (progressEvent.loaded / progressEvent.total) * 100;
                  setUploadProgress(progress);
                }
              },
            }
          );

          const newImages = response.data.urls;

          return newImages;
        } catch (error) {
          console.error("Upload error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          toast.error(`Upload failed for ${file.name}: ${errorMessage}`);
          throw error;
        }
      });

      const downloadURLs = await Promise.all(uploadPromises);

      setUploadState(false);
      setUploadProgress(null);

      const postData = {
        desc,
        imgUrls: JSON.stringify(downloadURLs.flat()),
      };

      console.log("Post Data: ", postData);

      // Create the post with the image URL
      mutation.mutate(postData as EditPost);
      closeButton.current?.click();

      removeThisImage(postId, removedImages);
      clearFileInput();
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to upload files: ${errorMessage}`);
      onError?.(error instanceof Error ? error : new Error("Upload failed"));
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

  const clearImage = (media: string) => {
    // check the if existed Media deleted
    if (previewUrls.includes(media)) {
      const newPreviewUrls = previewUrls.filter((url) => url !== media);
      setPreviewUrls(newPreviewUrls);
      setRemovedImages((prev) => [...prev, media]);
    }

    // check if new media is deleted
    if (newPreviewUrls.includes(media)) {
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
                {previewUrls.map((mediaUrl) => {
                  return (
                    <div key={mediaUrl} className="relative w-full mt-4">
                      <Image
                        src={mediaUrl}
                        alt="preview-image"
                        width={100}
                        height={100}
                        unoptimized={true}
                        className="w-full rounded-md"
                      />
                      <div
                        className="absolute p-2 bg-white rounded-full right-2 top-2 cursor-pointer"
                        onClick={() => clearImage(mediaUrl)}
                      >
                        X
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {uploadState && (
              <div className="w-full flex flex-col justify-center">
                <span className="text-center font-medium">
                  Post is Uploading...
                </span>
                <div className="flex items-center gap-1">
                  <Progress value={uploadProgress} />
                  <span className="font-semibold text-sm">
                    {Math.round(uploadProgress || 0)}%
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

const removeThisImage = async (postId: number, media: string[]) => {
  console.log("Getting, removing", postId, media);

  try {
    // remove the image from server
    const response = await axios.post(`${API_ENDPOINT}/posts/editpost/remove`, {
      postId,
      media,
    });
  } catch (e: any) {
    console.log(e.message);
    toast.error("Unable to remove massage");
  }
};

export default EditPostComponent;
