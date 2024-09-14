import { Request } from "express";

export interface User {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: User;
}
