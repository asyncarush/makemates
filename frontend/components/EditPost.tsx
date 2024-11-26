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
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

import { API_ENDPOINT } from "@/axios.config";

import { IoEllipsisVertical } from "react-icons/io5";
import { NewPost } from "@/typings";
import axios from "axios";
import { Button } from "./ui/button";
import Image from "next/image";

/**
 * EditPostComponent - A React component for editing and creating posts with image uploads
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.caption - The initial caption text for the post
 * @param {string} props.mediaUrl - The initial media URL for the post
 * @param {Function} props.onSuccess - Optional callback function called after successful upload
 * @param {Function} props.onError - Optional callback function called on upload failure
 *
 * @state
 * @property {boolean} isDropdownOpen - Controls the dropdown menu visibility
 * @property {boolean} isModalOpen - Controls the modal dialog visibility
 * @property {FileList | null} files - Currently selected files for upload
 * @property {string} desc - Post description/caption text
 * @property {string[]} previewUrls - Array of URLs for image previews
 * @property {boolean} uploadState - Indicates if an upload is in progress
 * @property {number | null} uploadProgress - Current upload progress percentage
 *
 * Features:
 * - Multiple image upload with preview
 * - MinIO storage integration via REST API
 * - Real-time upload progress tracking
 * - File validation (JPEG, PNG, max 5MB)
 * - Toast notifications for user feedback
 * - Responsive image preview
 *
 * @example
 * ```tsx
 * <EditPostComponent
 *   caption="Initial caption"
 *   mediaUrl="https://example.com/image.jpg"
 *   onSuccess={() => console.log('Upload successful')}
 *   onError={(error) => console.error('Upload failed:', error)}
 * />
 * ```
 */
interface UploadResponse {
  url: string;
}

interface EditPostProps {
  caption: string;
  mediaUrl: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const EditPostComponent = ({
  caption,
  mediaUrl,
  onSuccess,
  onError,
}: EditPostProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const [files, setFiles] = useState<FileList | null>(null);
  const [desc, setDesc] = useState<string>(caption);

  const [previewUrls, setPreviewUrls] = useState<string[]>([mediaUrl]);

  const [uploadState, setUploadState] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const closeButton = useRef<HTMLButtonElement>(null);

  const addMediaInput = useRef<HTMLInputElement>(null);

  const queryclient = useQueryClient();

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
  };

  const mutation = useMutation<NewPost, Error, NewPost>({
    mutationFn: async (newPost: NewPost) => {
      const response = await axios.post<NewPost>(`${API_ENDPOINT}/posts`, newPost, {
        withCredentials: true,
      });
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

  /**
   * Handles the upload of post content including images and description
   *
   * @param {React.FormEvent} e - Form submission event
   * @throws {Error} When file upload to MinIO fails
   * @returns {Promise<void>}
   *
   * Process:
   * 1. Validates file selection
   * 2. Creates FormData for each file
   * 3. Uploads files to MinIO via REST API
   * 4. Tracks upload progress
   * 5. Updates post with returned URLs
   * 6. Cleans up after upload
   */
  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return toast.error("No files selected!");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", fileName);

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

          return response.data.url;
        } catch (error) {
          console.error("Upload error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          toast.error(`Upload failed for ${file.name}: ${errorMessage}`);
          throw error;
        }
      });

      const downloadURLs = await Promise.all(uploadPromises);
      setUploadState(false);
      setUploadProgress(null);
      
      await mutation.mutateAsync({ desc, imgUrl: downloadURLs.join(",") });
      closeButton.current?.click();
      clearFileInput();
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to upload files: ${errorMessage}`);
      onError?.(error instanceof Error ? error : new Error("Upload failed"));
    }
  };

  /**
   * Handles the selection of multiple image files
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   * @returns {(() => void) | undefined} Cleanup function for preview URLs
   *
   * Validation:
   * - File types: JPEG, PNG only
   * - File size: Maximum 5MB per file
   * - Empty selection check
   *
   * Features:
   * - Creates preview URLs for selected images
   * - Maintains existing previews when adding more images
   * - Automatically cleans up preview URLs on unmount
   */
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

  /**
   * Triggers the file input click event for adding more media
   *
   * @param {React.MouseEvent<HTMLButtonElement>} e - Button click event
   * @description Programmatically triggers the hidden file input to open file selection dialog
   */
  const handleAddMedia = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addMediaInput.current?.click();
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
            {/* <DialogHeader></DialogHeader> */}
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
                        onClick={clearFileInput}
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

export default EditPostComponent;
