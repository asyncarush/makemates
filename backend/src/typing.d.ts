import { Request } from "express";

export interface User {
  id: number;
  email?: string;  // Make email optional to match the auth middleware
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
