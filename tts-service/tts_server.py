"""
Maya1 TTS Service
A FastAPI server that provides text-to-speech using the Maya1 model from Hugging Face.
"""

import os
import io
import logging
from typing import Optional
import torch
import torchaudio
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from snac import SNAC

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Maya1 TTS Service",
    description="Text-to-Speech service using Maya1 model",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:2000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
maya_model: Optional[AutoModelForCausalLM] = None
maya_tokenizer: Optional[AutoTokenizer] = None
snac_model: Optional[SNAC] = None
device = "cuda" if torch.cuda.is_available() else "cpu"

class TTSRequest(BaseModel):
    text: str
    voice_description: Optional[str] = "A friendly, warm female voice"
    rate: Optional[float] = 1.0


@app.on_event("startup")
async def load_models():
    """Load Maya1 and SNAC models on startup."""
    global maya_model, maya_tokenizer, snac_model

    try:
        logger.info(f"Loading models on device: {device}")

        # Load Maya1 model
        logger.info("Loading Maya1 model...")
        maya_model = AutoModelForCausalLM.from_pretrained(
            "maya-research/maya1",
            torch_dtype=torch.bfloat16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            trust_remote_code=True
        )

        maya_tokenizer = AutoTokenizer.from_pretrained(
            "maya-research/maya1",
            trust_remote_code=True
        )

        # Load SNAC audio codec
        logger.info("Loading SNAC model...")
        snac_model = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").eval().to(device)

        logger.info("Models loaded successfully!")

    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "device": device,
        "models_loaded": maya_model is not None and snac_model is not None
    }


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """
    Generate speech from text using Maya1.

    Args:
        request: TTSRequest with text and optional voice description

    Returns:
        Audio file as streaming response
    """
    if maya_model is None or snac_model is None:
        raise HTTPException(status_code=503, message="Models not loaded yet")

    try:
        logger.info(f"Generating speech for text: {request.text[:50]}...")

        # Format the prompt for Maya1
        # Using the format: <description="voice details"> text
        prompt = f'<description="{request.voice_description}"> {request.text}'

        # Tokenize input
        inputs = maya_tokenizer(prompt, return_tensors="pt").to(device)

        # Generate SNAC tokens
        with torch.no_grad():
            outputs = maya_model.generate(
                **inputs,
                max_new_tokens=2048,  # Adjust based on text length
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1,
            )

        # Extract SNAC tokens from generation
        # The model outputs special tokens that represent SNAC codes
        generated_tokens = outputs[0][inputs.input_ids.shape[1]:]

        # Convert tokens to SNAC codes
        # This is a simplified version - you may need to adjust based on Maya1's output format
        snac_codes = extract_snac_codes(generated_tokens)

        # Decode SNAC codes to audio
        with torch.no_grad():
            audio_output = snac_model.decode(snac_codes)

        # Convert to audio bytes
        audio_bytes = audio_to_bytes(audio_output)

        logger.info("Speech generation complete")

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )

    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def extract_snac_codes(tokens: torch.Tensor) -> torch.Tensor:
    """
    Extract SNAC codes from model output tokens.

    This is a placeholder - actual implementation depends on Maya1's token format.
    You may need to adjust this based on the model's documentation.
    """
    # Maya1 uses special tokens to represent SNAC codes
    # You'll need to parse these according to the model's format
    # For now, this is a simplified version

    # Convert tokens to SNAC format (7 codebooks as per SNAC spec)
    # This will need actual implementation based on Maya1 docs
    snac_codes = tokens.view(1, 7, -1)  # Reshape to SNAC format

    return snac_codes


def audio_to_bytes(audio_tensor: torch.Tensor, sample_rate: int = 24000) -> bytes:
    """
    Convert audio tensor to WAV bytes.

    Args:
        audio_tensor: Audio tensor from SNAC decoder
        sample_rate: Sample rate (default 24kHz for SNAC)

    Returns:
        WAV audio as bytes
    """
    # Ensure audio is on CPU and in correct shape
    audio_cpu = audio_tensor.cpu().squeeze()

    # Normalize audio to [-1, 1] range
    audio_normalized = audio_cpu / torch.max(torch.abs(audio_cpu))

    # Save to bytes buffer
    buffer = io.BytesIO()
    torchaudio.save(buffer, audio_normalized.unsqueeze(0), sample_rate, format="wav")
    buffer.seek(0)

    return buffer.getvalue()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("TTS_PORT", "8000"))
    logger.info(f"Starting Maya1 TTS server on port {port}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
