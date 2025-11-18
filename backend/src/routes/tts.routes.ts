/**
 * @fileoverview Routes for TTS (Text-to-Speech) operations
 */

import express from "express";
import { generateSpeech, checkTTSHealth } from "../controllers/tts.controller";
import auth from "../middleware/auth";

const router = express.Router();

// Generate speech from text
router.post("/generate", auth, generateSpeech);

// Check TTS service health
router.get("/health", checkTTSHealth);

export default router;
