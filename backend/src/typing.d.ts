import { Request } from "express";

export interface User {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: User;
}


// /**
//  * Interface for file upload request
//  */
// export interface FileUploadRequest extends Request {
//   file: Express.Multer.File;
// }
