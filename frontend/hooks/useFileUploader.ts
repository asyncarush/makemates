import { BACKEND_API } from "./../axios.config";
import { useState } from "react";
import Compressor from "compressorjs";

export const useFileUploader = () => {
  const [uploadState, setUploadState] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const uploadFile = async (files: FileList) => {
    setUploadState(true);
    setUploadProgress(0);
    let videoFiles: File[] = [];
    let imageFiles: File[] = [];

    Array.from(files).forEach((file: File) => {
      file.type.startsWith("video")
        ? videoFiles.push(file)
        : imageFiles.push(file);
    });

    const compressedImageFiles = await Promise.all(
      imageFiles.map(
        (file: File) =>
          new Promise((resolve, reject) => {
            new Compressor(file, {
              quality: 0.1,
              success(result) {
                resolve(result);
              },
              error(err) {
                reject(err);
                console.error(err.message);
              },
            });
          })
      )
    );

    // Create FormData with the compressed file
    let formData = new FormData();

    compressedImageFiles.forEach((file: any) => {
      const fileExtension = file.type.split("/")[1] || "jpg";
      const fileName = `image_${Date.now()}.${fileExtension}`;
      formData.append("post_images", file, fileName);
    });

    try {
      // Upload file to MinIO through backend API
      const uploadResponse = await BACKEND_API.post(`/upload`, formData, {
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
      });

      // Get the URL from the response
      setUploadState(false);
      return uploadResponse.data?.urls;
    } catch (error: any) {
      console.error("Failed to upload image: " + error.message);
      setUploadState(false);
      setUploadProgress(null);
      throw error;
    }
  };

  return { uploadFile, uploadProgress, uploadState };
};
