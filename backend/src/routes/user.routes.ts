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
} from "../controllers/user.controller";

import auth from "../middleware/auth";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logoutUser);
router.post("/update", auth, updateUserInfo);
router.post("/foxllow", auth, followUser);
router.post("/unfollow", auth, unfollowUser);
router.get("/friendList", auth, getFriendList);
router.post("/setProfilePic", auth, setProfilePic);
router.get("/me", auth, getUserData);
router.get("/notifications", auth, getUserNotifications);

export default router;
