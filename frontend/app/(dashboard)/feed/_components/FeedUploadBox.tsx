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
import { IoIosAddCircle } from "react-icons/io";
import { useNewPostMutation } from "@/lib/mutations";
import { useFileUploader } from "@/hooks/useFileUploader";
import AIResponseLoader from "@/components/AIResponseLoader";
import { BiSolidImageAdd } from "react-icons/bi";

function FeedUploadBox() {
  const [desc, setDesc] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[] | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [captionLoader, setCaptionLoader] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // Custom Hoooks
  const mutation = useNewPostMutation();
  const { uploadFile, uploadProgress, uploadState } = useFileUploader();

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

    const imageUrls = await uploadFile(files);

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

    if (!selectedFiles || selectedFiles.length === 0)
      return toast.error("Please select files");

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
                        text: "I want you be an agent that suggest cools captions by analysing the attached images. I expect the response in array, just give me array nothing else, Keep the captions shorts, also include some cools emojis.",
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
          toast.error("Failed to generate caption");
        }
      };
      reader.readAsDataURL(file);
    };

    generateCaptions();

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
          {/* <IoIosAddCircle className="w-8 h-8 text-gray-200 hover:text-gray-50" /> */}
          {/* import { BiSolidImageAdd } from "react-icons/bi"; */}
          <BiSolidImageAdd className="w-6 h-6 text-gray-200 hover:text-gray-50 outline-none border-none" />
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogTitle className="flex gap-8">
          <div>Share new Post</div>
          <div>{captionLoader && <AIResponseLoader />}</div>
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
          {/* caption suggestions area */}

          {captions.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {captions.map((caption) => {
                return (
                  <p
                    onClick={(e) => setDesc(e.currentTarget.innerText)}
                    key={caption}
                    className="text-[12px] bg-gradient-to-r from-blue-500 to-purple-500 text-white w-max px-2 py-0.5 rounded-xl hover:scale-105 transition-all duration-150 cursor-pointer"
                  >
                    {caption}
                  </p>
                );
              })}
            </div>
          )}

          <div>
            <div className="flex max-h-[200px] gap-1 overflow-y-auto">
              {previewUrls &&
                previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative my-2 w-[80px] h-[100px] rounded-lg"
                  >
                    <Image
                      src={url}
                      alt={`preview-${index}`}
                      className="object-cover rounded-lg"
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
              <Button
                onClick={() => clearFileInput()}
                ref={closeButton}
                variant={"destructive"}
                size={"sm"}
              >
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
