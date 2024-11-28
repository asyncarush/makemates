"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../controller/User");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post("/register", User_1.register);
router.post("/login", User_1.login);
router.get("/logout", auth_1.default, User_1.logoutUser);
router.post("/update", auth_1.default, User_1.updateUserInfo);
router.post("/follow", auth_1.default, User_1.followUser);
router.post("/unfollow", auth_1.default, User_1.unfollowUser);
router.get("/friendList", auth_1.default, User_1.getFriendList);
router.post("/setProfilePic", auth_1.default, User_1.setProfilePic);
router.get("/me", auth_1.default, User_1.getUserData);
exports.default = router;
