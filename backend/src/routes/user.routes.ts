import { Router } from "express";
import {
  login,
  register,
  getUserData,
  updateUserInfo,
  followUser,
  unfollowUser,
  getFriendList,
  setProfilePic,
  logoutUser,
  getUserNotifications,
  markNotificationsAsRead,
} from "../controllers/user.controller";

import auth from "../middleware/auth";

const router: Router = Router();

// Test route for cookie debugging
router.get("/test-cookie", (req, res) => {
  // Log incoming cookies
  console.log("Test route - cookies received:", req.cookies);

  // Set a test cookie
  res.cookie("test-cookie", "test-value", {
    httpOnly: false, // Make it visible to JavaScript
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Test cookie set",
    receivedCookies: req.cookies,
  });
});

// Test route for environment variables and JWT key
router.get("/debug-env", (req, res) => {
  return res.status(200).json({
    jwtKeyDefined: Boolean(process.env.JWT_PRIVATE_KEY),
    nodeEnv: process.env.NODE_ENV || "not set",
    cookieParser: Boolean(req.cookies),
  });
});

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logoutUser);
router.post("/update", auth, updateUserInfo);
router.post("/follow", auth, followUser);

router.post("/unfollow", auth, unfollowUser);

router.get("/friendList", auth, getFriendList);
router.post("/setProfilePic", auth, setProfilePic);
router.get("/me", auth, getUserData);
router.get("/notifications", auth, getUserNotifications);
router.post("/notifications/mark-read", auth, markNotificationsAsRead);

export default router;
