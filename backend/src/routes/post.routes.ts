import { Router } from "express";
import {
  getUserPosts,
  addPost,
  likeThePost,
  unLikeThePost,
  checkPostLikeStatus,
  postNewComment,
  getPostComments,
  editPost,
  removeThisImage,
  postNewReply,
  getCommentReplies,
} from "../controllers/post.controller";

import auth from "../middleware/auth";

const router: Router = Router();

// Retrieve posts for a specific user
router.get("/:userId", auth, getUserPosts);

// Add a new post
router.post("/", auth, addPost);

// Edit a post
router.post("/edit/:postId", auth, editPost);

// Edit Post : remove image
router.post("/editpost/remove", auth, removeThisImage);

// Like a post
router.post("/like", auth, likeThePost);

// Unlike a post
router.post("/unlike", auth, unLikeThePost);

// Check if a post is liked by the user
router.post("/like/status", auth, checkPostLikeStatus);

// Add a new comment to a post
router.post("/comments/add", auth, postNewComment);

// Add a new reply to a comment
router.post("/comments/reply", auth, postNewReply);

// Retrieve comments for a specific post
router.get("/comments/:postId", auth, getPostComments);

// Retrieve replies for a specific comment
router.get("/comments/reply/:commentId", auth, getCommentReplies);

export default router;
