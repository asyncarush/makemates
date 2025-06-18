"use client";

import React, { useRef, useState } from "react";
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
import { useNewPostMutation } from "@/lib/mutations";
import { useFileUploader } from "@/hooks/useFileUploader";
import AIResponseLoader from "@/components/AIResponseLoader";
import { BiSolidImageAdd } from "react-icons/bi";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { MdCloudUpload } from "react-icons/md";

interface PreviewURL {
  type: string;
  url: string;
}

function FeedUploadBox() {
  const [desc, setDesc] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<PreviewURL[] | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [captionLoader, setCaptionLoader] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  // Custom Hoooks
  const mutation = useNewPostMutation();
  const { uploadFiles, isUploading, progress } = useFileUploader();

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      desc,
      imgUrls: "",
    };

    if (!files || files.length === 0) {
      //Create post wihout images
      mutation.mutate(postData as NewPost);
      closeButton.current?.click();
      return toast.success("Post Uploaded");
    }

    const imageUrls = await uploadFiles(files);

    postData.imgUrls = JSON.stringify(imageUrls);
    // Create the post with the image URL
    mutation.mutate(postData);

    clearFileInput();
    closeButton.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const selectedFiles = e.target.files;
    setCaptionLoader(true);
    setCaptions([]); // for regenerating captions on file change

    if (!selectedFiles || selectedFiles.length === 0)
      return toast.error("Please select files");

    const arrayOfFileList = Array.from(selectedFiles);

    // Validate file types and sizes
    const validFileTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/3gpp",
    ];

    const maxFileSize = 100 * 1024 * 1024; // 5MB

    const invalidFiles = arrayOfFileList.filter(
      (file) => !validFileTypes.includes(file.type) || file.size > maxFileSize
    );

    if (invalidFiles.length > 0) {
      toast.error(
        "Some files are invalid. Please only upload images under 100MB."
      );
      return;
    }
    setFiles(selectedFiles);
    // Create and add new preview URLs
    const newPreviewUrls = arrayOfFileList.map((file) => {
      return { type: file.type.split("/")[0], url: URL.createObjectURL(file) };
    });
    // Update preview URLs while maintaining the existing ones
    setPreviewUrls(newPreviewUrls);

    const file = selectedFiles[0];

    const generateCaptions = async () => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyByOlpTA2YVndh6yxqGUQOZh9vdxOxsqKA`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: base64String, // ✅ Actual data
                        },
                      },
                      {
                        text: "I want you be an agent that suggest cool captions by analysing the attached images. I expect the response in array, just give me array nothing else, Keep the captions shorts, also include some cools emojis.",
                      },
                    ],
                  },
                ],
              }),
            }
          );

          const data = await response.json();
          const suggestedCaption =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No caption found";

          const parsedContent = JSON.parse(suggestedCaption);
          setCaptions((prev) => [...prev, ...parsedContent]);
          console.log(captions);

          setCaptionLoader(false);
        } catch (err) {
          console.error("Caption API error:", err);
          toast.error("Currently caption generation support for single image.");
        }
      };
      reader.readAsDataURL(file);
    };

    generateCaptions();

    // Clean up old preview URLs when component unmounts
    return () => {
      newPreviewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  };

  const clearFileInput = () => {
    setFiles(null);
    setPreviewUrls([]);
    setCaptions([]);
    setCaptionLoader(false);

    if (formRef.current) {
      const fileInput = formRef.current.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
    videoRef.current!.currentTime = 0; // reset to beginning
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="border-none outline-none">
        <Button
          variant="link"
          className="outline-none border-none ring-0 rounded-full p-2 transition-all hover:scale-110 duration-100"
        >
          <BiSolidImageAdd className="w-6 h-6 text-white dark:text-gray-300 outline-none border-none transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50 max-w-lg ">
        <DialogTitle className="flex items-center justify-start gap-4 text-gray-900 dark:text-gray-100 text-base font-semibold mb-3">
          <div className="text-xs p-2 bg-gradient-to-r rounded-full from-indigo-500 to-purple-500  flex items-center justify-center">
            <BiSolidImageAdd className="w-4 h-4 mr-1 rounded-full text-white" />
            {"  "}
            Share New Post
          </div>
          {captionLoader && <AIResponseLoader />}
        </DialogTitle>
        <form
          ref={formRef}
          onSubmit={(e) => handleUploadPost(e)}
          encType="multipart/form-data"
          className="space-y-3"
        >
          <div className="relative">
            <textarea
              rows={3}
              value={desc}
              placeholder="What's on your mind? Share your thoughts..."
              className="bg-gray-50/80 dark:bg-gray-800/80 w-full outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg p-3 border border-gray-200/50 dark:border-gray-600/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors text-sm"
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* caption suggestions area */}
          {captions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Suggested captions:
              </p>
              <div className="flex flex-wrap gap-1">
                {captions.map((caption) => {
                  return (
                    <button
                      onClick={(e) => setDesc(e.currentTarget.innerText)}
                      key={caption}
                      className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-full hover:from-indigo-600 hover:to-purple-600 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      {caption}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview Images/Videos */}
          {previewUrls && previewUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Preview:
              </p>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {previewUrls.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-600/50 flex-shrink-0"
                  >
                    {preview.type === "image" ? (
                      <Image
                        src={preview.url}
                        alt={`preview-${index}`}
                        className="object-cover"
                        fill
                        loading="lazy"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        src={preview.url}
                        muted
                        preload="metadata"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="object-cover w-full h-full"
                      />
                    )}
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 duration-150">
                      <IoMdClose className="w-2 h-2 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Add media:
            </p>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <MdCloudUpload className="w-4 h-4 text-white" />
                  </div>
                  <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Images and videos up to 100MB
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  name="postImage"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, video/*"
                  multiple
                />
              </label>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <DialogClose asChild>
              <Button
                onClick={() => clearFileInput()}
                ref={closeButton}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 px-4 py-1.5 text-xs"
              >
                <IoMdClose className="w-3 h-3" />
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isUploading}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-lg hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl transition-all duration-200 px-4 py-1.5 text-xs disabled:opacity-50"
            >
              <IoMdSend className="w-3 h-3" />
              {isUploading ? "Sharing..." : "Share Post"}
            </Button>
          </DialogFooter>
        </form>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-3 space-y-2 p-3 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                Uploading post...
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {progress}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FeedUploadBox;
