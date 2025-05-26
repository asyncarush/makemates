"use strict";
/**
 * @fileoverview Authentication middleware for protecting routes.
 * Verifies JWT tokens and attaches user information to requests.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Authentication
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware function
const auth = (req, res, next) => {
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
    if (!token)
        return res.status(401).send("Access denied. No token provided.");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "jwt-secret-key");
        // Ensure the ID is a number to match the User type
        const userId = typeof decoded.id === 'string' ? parseInt(decoded.id, 10) : decoded.id;
        // Create user object with proper typing
        const user = { id: userId };
        // Add email if it exists in the token
        if (decoded.email) {
            user.email = decoded.email;
        }
        // Set the user property on req
        req.user = user;
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error);
        res.status(400).send("Invalid token.");
    }
};
exports.default = auth;
