"use client";

import React, { useRef, useState } from "react";
import axios from "axios";

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

import { NewPost } from "@/typings";
import { IoIosAddCircle } from "react-icons/io";
import { API_ENDPOINT } from "@/axios.config";
import { useNewPostMutation } from "@/lib/mutations";
import { useFileUploader } from "@/hooks/useFileUploader";

function FeedUploadBox() {
  const [desc, setDesc] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[] | null>(null);
  // const [uploadState, setUploadState] = useState<boolean>(false);
  // const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const mutation = useNewPostMutation();

  const { uploadFile, uploadProgress, uploadState } = useFileUploader();

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      //Create post wihout images
      const postData = {
        desc,
        imgUrls: "",
      };
      mutation.mutate(postData as NewPost);
      closeButton.current?.click();
      return toast.success("Post Uploaded");
    }

    const imageUrls = await uploadFile(files);

    const postData = {
      desc: desc,
      imgUrls: JSON.stringify(imageUrls),
    };

    // Create the post with the image URL
    mutation.mutate(postData);

    clearFileInput();
    closeButton.current?.click();
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
        <DialogTitle className="flex justify-between">
          <div>Share new Post</div>
          <div></div>
        </DialogTitle>
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
                  <div key={index} className="relative w-full h-[200px] my-2">
                    <Image
                      src={url}
                      alt={`preview-${index}`}
                      className="object-contain rounded-lg"
                      fill
                      loading="lazy"
                      // priority={index === 0}
                    />
                  </div>
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
