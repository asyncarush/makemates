/**
 * @fileoverview Controller for handling TTS (Text-to-Speech) requests
 * Proxies requests to the Maya1 TTS Python service
 */

import { Request, Response } from "express";
import axios from "axios";
import { logger } from "../config/winston";

// TTS Service configuration
const TTS_SERVICE_URL =
  process.env.TTS_SERVICE_URL || "http://localhost:8000";

interface TTSRequest {
  text: string;
  voiceDescription?: string;
  rate?: number;
}

/**
 * Generate speech from text using Maya1 TTS service
 *
 * @param req - Express request
 * @param res - Express response
 */
export const generateSpeech = async (req: Request, res: Response) => {
  const { text, voiceDescription, rate }: TTSRequest = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    logger.info(`Generating speech for text: ${text.substring(0, 50)}...`);

    // Call the Python TTS service
    const response = await axios.post<ArrayBuffer>(
      `${TTS_SERVICE_URL}/api/tts`,
      {
        text,
        voice_description:
          voiceDescription || "A friendly, warm female voice",
        rate: rate || 1.0,
      },
      {
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
      }
    );

    // Set proper headers for audio
    res.set({
      "Content-Type": "audio/wav",
      "Content-Disposition": "attachment; filename=speech.wav",
      "Cache-Control": "no-cache",
    });

    // Send the audio data (response.data is already a Buffer in Node.js)
    return res.send(Buffer.from(response.data as ArrayBuffer));
  } catch (error: any) {
    logger.error("Error generating speech:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "TTS service unavailable",
        message:
          "The TTS service is not running. Please start it with: cd tts-service && ./start.sh",
      });
    }

    return res.status(500).json({
      error: "Failed to generate speech",
      message: error.message,
    });
  }
};

interface TTSHealthResponse {
  status: string;
  device: string;
  models_loaded: boolean;
}

/**
 * Check if TTS service is available
 *
 * @param req - Express request
 * @param res - Express response
 */
export const checkTTSHealth = async (req: Request, res: Response) => {
  try {
    const response = await axios.get<TTSHealthResponse>(`${TTS_SERVICE_URL}/health`, {
      timeout: 5000,
    });

    return res.status(200).json({
      available: true,
      ...response.data,
    });
  } catch (error) {
    return res.status(503).json({
      available: false,
      message: "TTS service is not available",
    });
  }
};
