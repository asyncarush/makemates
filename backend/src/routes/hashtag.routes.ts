/**
 * @fileoverview Routes for hashtag-related operations
 */

import express from "express";
import {
  getPostsByHashtag,
  searchHashtags,
  getTrendingHashtags,
  getHashtagInfo,
} from "../controllers/hashtag.controller";

const router = express.Router();

// Get posts by hashtag name
router.get("/hashtag/:tagName", getPostsByHashtag);

// Search hashtags (autocomplete)
router.get("/search", searchHashtags);

// Get trending hashtags
router.get("/trending", getTrendingHashtags);

// Get hashtag info
router.get("/info/:tagName", getHashtagInfo);

export default router;
