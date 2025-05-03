/**
 * @fileoverview Authentication middleware for protecting routes.
 * Verifies JWT tokens and attaches user information to requests.
 */

// Core Express types
import { Request, Response, NextFunction } from "express";

// Authentication
import jwt from "jsonwebtoken";

// Custom types
import { RequestWithUser } from "../typing";

// Middleware function
const auth = (req: RequestWithUser, res: Response, next: NextFunction) => {
  // Get token from cookies or Authorization header
  let token = req.cookies["x-auth-token"];

  // Check Authorization header if no cookie token
  const authHeader = req.header("Authorization");
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Only log cookies for debugging if needed
  if (process.env.NODE_ENV === "development") {
    console.log("Auth header:", authHeader);
    console.log("Auth token present:", Boolean(token));
  }

  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(
      token,
      (process.env.JWT_PRIVATE_KEY as string) || "jwt-secret-key"
    ) as { id: number };

    // Set the user property on req
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(400).send("Invalid token.");
  }
};

export default auth;
