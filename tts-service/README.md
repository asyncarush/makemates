# Maya1 TTS Service

Open-source Text-to-Speech service using [Maya1](https://huggingface.co/maya-research/maya1) model from Hugging Face.

## Features

- ✅ **Open Source & Free** - No API costs
- ✅ **High Quality** - Natural, expressive voices
- ✅ **Customizable** - Control voice style with natural language
- ✅ **Fast** - Real-time streaming capable
- ✅ **Local** - Runs on your own hardware

## Requirements

### Hardware

- **GPU**: NVIDIA GPU with 16GB+ VRAM (recommended)
  - RTX 3090, RTX 4090, A100, etc.
  - Can run on CPU but will be slower
- **RAM**: 16GB+ system RAM
- **Storage**: ~10GB for models

### Software

- Python 3.9+
- CUDA 11.8+ (for GPU support)
- pip

## Installation

### 1. Check Your System

```bash
# Check if you have a CUDA-capable GPU
nvidia-smi

# Check Python version (should be 3.9+)
python3 --version
```

### 2. Install Dependencies

```bash
cd tts-service

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Mac/Linux
# OR
venv\\Scripts\\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

**Note:** First installation may take 10-20 minutes as it downloads the models (~6GB).

### 3. Start the Service

```bash
# Simple start
./start.sh

# Or manually
python tts_server.py
```

The service will start on `http://localhost:8000`

### 4. Verify It's Working

Open another terminal:

```bash
# Check health
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","device":"cuda","models_loaded":true}
```

## Usage

### From the MakeMates App

Once the TTS service is running, the AI Assistant will automatically use it for voice generation. No additional configuration needed!

### Direct API Usage

```bash
# Generate speech
curl -X POST http://localhost:8000/api/tts \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello! This is Maya1 speaking.",
    "voice_description": "A friendly, warm female voice"
  }' \\
  --output speech.wav

# Play the audio
open speech.wav  # Mac
# OR
xdg-open speech.wav  # Linux
# OR
start speech.wav  # Windows
```

## Configuration

### Environment Variables

Create a `.env` file in the `tts-service` directory:

```env
# Port to run the service on (default: 8000)
TTS_PORT=8000

# Device to use (cuda/cpu)
DEVICE=cuda

# Model cache directory (optional)
HF_HOME=./model_cache
```

### Voice Customization

You can customize the voice by changing the `voice_description` parameter:

```json
{
  "text": "Your text here",
  "voice_description": "A cheerful young female with a British accent",
  "rate": 1.0
}
```

**Examples:**
- "A deep, authoritative male voice"
- "A soft, gentle female voice with emotion"
- "An energetic, upbeat narrator"
- "A calm, soothing meditation guide"

## Troubleshooting

### "Models not loaded yet"

The models take time to load on first start (2-5 minutes). Wait and try again.

### "CUDA out of memory"

Your GPU doesn't have enough VRAM. Try:

1. Close other GPU-using applications
2. Edit `tts_server.py` to use CPU:
   ```python
   device = "cpu"  # Change from "cuda"
   ```

### "TTS service unavailable"

Make sure the Python service is running:

```bash
cd tts-service
./start.sh
```

### Slow performance on CPU

This is normal. Maya1 is optimized for GPU. Consider:

1. Using the browser TTS fallback (automatic)
2. Upgrading to a GPU machine
3. Using a cloud GPU service (Google Colab, AWS, etc.)

## Advanced: Cloud Deployment

### Deploy on Google Colab (Free GPU)

1. Upload `tts_server.py` to Google Colab
2. Install dependencies
3. Run with ngrok to expose the service:

```python
# In Colab notebook
!pip install pyngrok
from pyngrok import ngrok

# Start ngrok tunnel
public_url = ngrok.connect(8000)
print(f"TTS Service: {public_url}")

# Start server
!python tts_server.py
```

4. Update backend `.env`:
```env
TTS_SERVICE_URL=https://your-ngrok-url.ngrok.io
```

### Deploy on AWS/GCP

Use a GPU instance (e.g., AWS p3.2xlarge, GCP T4) and follow standard installation steps.

## Performance

- **First request**: 3-5 seconds (model loading)
- **Subsequent requests**: 0.5-2 seconds
- **Concurrent requests**: Handled sequentially
- **Memory usage**: ~8-10GB VRAM

## API Documentation

Once running, visit: `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## License

Maya1 model: MIT License (see Hugging Face model card)
This service code: Same as parent project

## Support

For issues specific to Maya1 TTS service:
1. Check the logs in terminal
2. Try the health endpoint: `curl http://localhost:8000/health`
3. Check Hugging Face discussions: https://huggingface.co/maya-research/maya1/discussions
