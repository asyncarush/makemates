import { Request, Response } from "express";
import { uploadFile, MinioServiceError } from "../services/minio.service";

// Add type assertion or custom interface for files
interface CustomRequest extends Request {
  files?:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[];
}

export const uploadFileController = async (
  req: CustomRequest,
  res: Response
) => {
  // Ensure files exist and is an array
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  // Use Array.from to ensure it's an array
  const files = Array.isArray(req.files)
    ? req.files
    : req.files
    ? Object.values(req.files).flat()
    : [];

  // Use .map or .forEach as needed
  const urls = await Promise.all(
    files.map(async (file) => {
      const fileName = `${Date.now()}-${file.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;

      // Your file upload logic here
      return uploadFile(file, fileName);
    })
  );

  console.log("All images url :", urls);
  res.json({
    success: true,
    message: "Files uploaded successfully",
    urls,
  });
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File not found!!",
    });
  }

  console.log("Profile Picture", req.file);

  const fileName = `profile-pc-${Date.now()}-${req.file.originalname}`;

  console.log("Filename : ", fileName);

  // this will save the file in MiniBucket
  const url = await uploadFile(req.file, fileName);

  res.status(200).json({
    success: true,
    message: "ProfilePic uploaded",
    url,
  });
};
