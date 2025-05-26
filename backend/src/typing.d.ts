import { Request } from "express";

export interface User {
  id: number;
  email?: string; // Make email optional to match the auth middleware
}

export interface RequestWithUser extends Request {
  user?: User;
}

export interface MediaFile {
  url: string;
  type: "image" | "video";
  originalName: string;
  size: number;
  mimeType: string;
}

// /**
//  * Interface for file upload request
//  */
// export interface FileUploadRequest extends Request {
//   file: Express.Multer.File;
// }

// Type definitions
interface OllamaChatResponse {
  message: {
    content: string;
  };
  model: string;
  created_at: string;
  done: boolean;
}

interface Post {
  id: number;
  desc: string | null;
  date: Date;
  author_name: string;
  media_count: number;
}

interface SimilarPost {
  id: number;
  desc: string | null;
  date: Date;
  author_name: string;
  similarity: number;
}
interface Notification {
  id: number;
  name: string;
  message: string;
  notificationcategory: string;
  date: Date;
  postdesc: string | null;
}
