import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../typing";

// Middleware function
const auth = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied.");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_PRIVATE_KEY as string
    ) as { id: number };

    // Set the user property on req
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

export default auth;
