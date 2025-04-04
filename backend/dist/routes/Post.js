"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Post_1 = require("../controller/Post");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// Retrieve posts for a specific user
router.get("/:userId", auth_1.default, Post_1.getUserPosts);
// Add a new post
router.post("/", auth_1.default, Post_1.addPost);
// Like a post
router.post("/like", auth_1.default, Post_1.likeThePost);
// Unlike a post
router.post("/unlike", auth_1.default, Post_1.unLikeThePost);
// Check if a post is liked by the user
router.post("/like/status", auth_1.default, Post_1.checkPostLikeStatus);
// Add a new comment to a post
router.post("/comments/add", auth_1.default, Post_1.postNewComment);
// Retrieve comments for a specific post
router.get("/comments/:postId", auth_1.default, Post_1.getPostComments);
exports.default = router;
