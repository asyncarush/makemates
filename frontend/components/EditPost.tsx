import React, { useContext, useEffect, useRef, useState } from "react";
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

export const EditPostComponent = (props: any) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const [files, setFiles] = useState<FileList | null>(null);
  const [desc, setDesc] = useState<string>("anything");

  const [previewUrls, setPreviewUrls] = useState<string[]>([
    "https://placehold.co/600x400/png",
  ]);

  console.log(props);

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

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return toast.error("No file selected!");
    const storage = getStorage(app);
    const fileName = file.name + Date.now();
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

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
        toast.error("Upload failed.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadState(false);
          setUploadProgress(null);
          mutation.mutate({ desc, imgUrl: downloadURL });
          closeButton.current?.click();
          clearFileInput();
        });
      }
    );
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

  const handleAddMedia = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    console.log("Add More Images");
    addMediaInput.current?.click();
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // e.stopPropagation();
    if (e.target.files) {
      if (e.target.files?.length < 0) {
        toast.error("Please select the files");
      }
      setFiles(e.target.files);

      console.log("Uploaded files : ", files);

      // Now create previewUrls for each
      if (files) {
        const arraysOffile = Object.entries(files);

        arraysOffile.map((file) =>
          setPreviewUrls((prev) => [...prev, URL.createObjectURL(files[1])])
        );
      }
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

            {/* {previewUrl && (
                <div className="relative w-full mt-4">
                  <Image
                    src={previewUrl}
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
              )} */}

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
