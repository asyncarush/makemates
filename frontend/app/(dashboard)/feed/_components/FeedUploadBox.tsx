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
} from "@/components/ui/dialog";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { NewPost } from "@/typings";
import { IoIosAddCircle } from "react-icons/io";
import { API_ENDPOINT } from "@/axios.config";

function FeedUploadBox() {
  const [desc, setDesc] = useState<string>("");
  const [file, setFile] = useState<any>();

  const [previewUrl, setPreviewUrl] = useState<string | StaticImport>("");
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
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      new Compressor(file, {
        quality: 0.2,
        async success(result: any) {
          setUploadState(true);
          
          // Create FormData with the compressed file
          const formData = new FormData();
          const fileName = result.name + Date.now() + "." + result.type.split("/")[1];
          formData.append("file", result, fileName);
          
          try {
            // Upload file to MinIO through backend API
            const uploadResponse = await axios.post(
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
            const imageUrl = uploadResponse.data.url;
            
            // Clear the form and reset states
            setUploadState(false);
            setUploadProgress(null);
            clearFileInput();
            
            // Create the post with the image URL
            mutation.mutate({ desc, imgUrl: imageUrl });
            closeButton.current?.click();
          } catch (error: any) {
            setUploadState(false);
            setUploadProgress(null);
            toast.error("Failed to upload image: " + error.message);
          }
        },
        error(err) {
          toast.error(err.message);
        },
      });
    } catch (error: any) {
      toast.error("Error processing image: " + error.message);
    }
  };

  const clearFileInput = () => {
    setDesc("");
    setFile(undefined);
    setPreviewUrl("");
    if (formRef.current) {
      const fileInput: any =
        formRef.current.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files ? e.target.files[0] : undefined;
    setFile(newFile);
    if (newFile) {
      const newPreviewUrl = URL.createObjectURL(newFile);
      setPreviewUrl(newPreviewUrl);
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
        <form ref={formRef} onSubmit={(e) => handleUploadPost(e)}>
          <h3 className="font-medium text-2xl">Share new Post</h3>
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
              {file && (
                <Image
                  alt="preview-image"
                  src={previewUrl}
                  width="50"
                  height="50"
                  quality="50"
                  className="w-full rounded-md"
                />
              )}
            </div>
            <input
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
