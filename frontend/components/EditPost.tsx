import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "@/firebase";
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
 *
 * Features:
 * - Multiple image upload with preview
 * - Firebase storage integration
 * - Progress tracking for uploads
 * - File validation (size and type)
 * - Toast notifications for user feedback
 *
 * @example
 * ```tsx
 * <EditPostComponent caption="Initial caption" mediaUrl="https://example.com/image.jpg" />
 * ```
 */
export const EditPostComponent = (props: any) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const [files, setFiles] = useState<FileList | null>(null);
  const [desc, setDesc] = useState<string>(props.caption);

  const [previewUrls, setPreviewUrls] = useState<string[]>([props.mediaUrl]);

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
    mutationFn: (newPost: NewPost) => {
      return axios.post(`${API_ENDPOINT}/posts`, newPost, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["newPost"] });
    },
  });

  /**
   * Handles the upload of post content including images and description
   *
   * @param {React.FormEvent} e - Form submission event
   * @throws {Error} When file upload to Firebase fails
   */
  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return toast.error("No files selected!");

    const storage = getStorage(app);
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileName = file.name + Date.now();
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            setUploadState(true);
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error(error);
            toast.error(`Upload failed for ${file.name}`);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    });

    try {
      const downloadURLs = await Promise.all(uploadPromises);
      setUploadState(false);
      setUploadProgress(null);
      mutation.mutate({ desc, imgUrl: downloadURLs.join(",") });
      closeButton.current?.click();
      clearFileInput();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload some files");
    }
  };

  /**
   * Handles the selection of multiple image files
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   * @validates
   * - File types (JPEG, PNG)
   * - File size (max 5MB)
   * @generates Preview URLs for selected images
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
   * Removes preview URLs and cleans up object URLs
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
    console.log("Add More Images");
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
