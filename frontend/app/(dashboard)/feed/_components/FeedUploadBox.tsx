"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import Compressor from "compressorjs";
import Image from "next/image";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { NewPost } from "@/typings";
import { IoIosAddCircle } from "react-icons/io";
import { API_ENDPOINT } from "@/axios.config";

function FeedUploadBox() {
  const [desc, setDesc] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

  const [previewUrls, setPreviewUrls] = useState<string[] | null>(null);

  const [uploadState, setUploadState] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const queryclient = useQueryClient();

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

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading files: ", files);
    if (!files || files.length === 0) return toast.error("No files selected!");

    const compressedFiles = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise((resolve, reject) => {
            new Compressor(file, {
              quality: 0.2,
              success(result) {
                resolve(result);
              },
              error(err) {
                reject(err);
                toast.error(err.message);
              },
            });
          })
      )
    );

    // Create FormData with the compressed file
    let formData = new FormData();

    compressedFiles.forEach((file: any) => {
      const fileExtension = file.type.split("/")[1] || "jpg";
      const fileName = `image_${Date.now()}.${fileExtension}`;
      formData.append("post_images", file, fileName);
    });

    console.log("uploading files to minio");
    try {
      // Upload file to MinIO through backend API
      const uploadResponse: any = await axios.post(
        `${API_ENDPOINT}/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      // Get the URL from the response
      const imageUrl = uploadResponse.data.urls;

      // Clear the form and reset states
      setUploadState(false);
      setUploadProgress(null);
      clearFileInput();

      const postData = {
        desc: desc,
        imgUrls: JSON.stringify(imageUrl),
      };

      console.log("Post Data: ", postData);

      // Create the post with the image URL
      mutation.mutate(postData);
      closeButton.current?.click();
    } catch (error: any) {
      setUploadState(false);
      setUploadProgress(null);
      toast.error("Failed to upload image: " + error.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (prev && prev.length > 0) {
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

  return (
    <Dialog>
      <DialogTrigger asChild className="border-none outline-none">
        <Button variant="ghost" className="hover:bg-transparent outline-none">
          <IoIosAddCircle className="w-8 h-8 text-gray-200 hover:text-gray-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Share new Post</DialogTitle>
        <form
          ref={formRef}
          onSubmit={(e) => handleUploadPost(e)}
          encType="multipart/form-data"
        >
          <textarea
            rows={3}
            cols={60}
            value={desc}
            placeholder="What's on your mind?"
            className="bg-transparent w-full outline-none resize-none"
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="border-1 border-slate-100">
            <div className="max-h-[200px] overflow-y-auto">
              {previewUrls &&
                previewUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt="preview"
                    width={100}
                    height={100}
                  />
                ))}
            </div>
            <input
              multiple={true}
              type="file"
              name="postImage"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, video/*"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button ref={closeButton} variant={"destructive"} size={"sm"}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant={"default"} size={"sm"}>
              Share
            </Button>
          </DialogFooter>
        </form>
        <div className="w-full flex flex-col justify-center">
          {uploadState && (
            <span className="text-center font-medium">
              Post is Uploading...
            </span>
          )}
          {uploadState && (
            <div className="flex items-center gap-1">
              <Progress value={uploadProgress} />
              <span className="font-semibold text-sm">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FeedUploadBox;
