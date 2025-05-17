import { BACKEND_API } from "../axios.config";
import { useState, useCallback } from "react";

export interface UploadedFile {
  url: string;
  type: "image" | "video";
  size: number;
  originalName: string;
}

interface UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

export const useFileUploader = (options: UploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadFiles = useCallback(
    async (files: FileList): Promise<UploadedFile[]> => {
      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });

        const response = await BACKEND_API.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setProgress(percentCompleted);
            options.onUploadProgress?.(
              progressEvent as unknown as ProgressEvent
            );
          },
        });

        if (response.data.success && response.data.files) {
          setUploadedFiles((prev) => [...prev, ...response.data.files]);
          return response.data.files;
        }

        throw new Error("Failed to upload files");
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to upload files");
        setError(error);
        throw error;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    uploadFiles,
    isUploading,
    progress,
    error,
    uploadedFiles,
    reset,
  };
};
