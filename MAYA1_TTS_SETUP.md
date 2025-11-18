# Maya1 TTS Quick Start Guide

## What is This?

Your AI Assistant now uses **Maya1** - an open-source, free alternative to ElevenLabs for voice generation.

## Quick Start (5 minutes)

### Step 1: Check Requirements

You need a **GPU with 16GB+ VRAM** or be willing to wait longer on CPU.

```bash
# Check if you have NVIDIA GPU
nvidia-smi
```

**Don't have a GPU?** The app will automatically fall back to browser TTS (still free!).

### Step 2: Start TTS Service

Open a new terminal:

```bash
cd /Users/arush-mac/Driver/Codes/Projects/makemates/tts-service
./start.sh
```

**First time?** This will:
- Create a Python virtual environment
- Install dependencies (~5 minutes)
- Download Maya1 model (~6GB, one-time download)
- Start the TTS server on port 8000

### Step 3: Restart Your App

```bash
# In backend terminal (Ctrl+C then restart)
cd backend
npm run dev

# In frontend terminal (Ctrl+C then restart)
cd frontend
npm run dev
```

### Step 4: Test It!

1. Open the app: `http://localhost:3000`
2. Click the AI Assistant button (bottom-right)
3. Listen to the voice!

## How It Works

```
┌─────────────┐
│  Frontend   │
│ (React)     │
└──────┬──────┘
       │ 1. Click AI button
       ▼
┌─────────────┐
│  Backend    │
│ (Express)   │ 2. Proxies request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ TTS Service │ 3. Maya1 generates
│  (Python)   │    audio with voice
└──────┬──────┘
       │
       ▼
    🔊 Audio plays in browser!
```

## Terminal Windows You Need

You'll need **3 terminals** running:

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm run dev`
3. **TTS Service**: `cd tts-service && ./start.sh`

## Common Issues

### "TTS service unavailable"

**Solution:** Make sure terminal #3 is running the TTS service.

### "CUDA out of memory"

**Solutions:**
- Close other GPU apps
- Or use CPU (slower but works)
- Or app will auto-fallback to browser TTS

### "Models not loaded yet"

**Solution:** Wait 2-5 minutes after starting. Models are loading.

### Don't want to run TTS service?

**No problem!** The app automatically falls back to browser's built-in voice if Maya1 isn't available.

## Cloud Alternative (Free GPU)

Don't have a GPU locally? Use Google Colab for free:

1. Go to: https://colab.research.google.com
2. Upload `tts-service/tts_server.py`
3. Follow cloud deployment instructions in `tts-service/README.md`

## Performance

- **GPU**: ~1 second per sentence ⚡
- **CPU**: ~5-10 seconds per sentence 🐢
- **Browser TTS**: Instant (but robotic voice)

## Stop the TTS Service

When done:
```bash
# In the TTS service terminal
Ctrl+C
```

## Full Documentation

See `tts-service/README.md` for:
- Advanced configuration
- Voice customization
- Cloud deployment
- Troubleshooting

## Need Help?

1. Check TTS service logs (terminal #3)
2. Check health: `curl http://localhost:8000/health`
3. See detailed README in `tts-service/` folder
