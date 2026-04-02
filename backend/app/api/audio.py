"""
Audio API — ElevenLabs TTS and STT endpoints.
POST /api/audio/speak   — convert text to speech, returns audio bytes
POST /api/audio/transcribe — convert uploaded audio to text
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response

from ..dependencies import get_current_user
from ..models.user import User
from ..services.model_router import generate_audio_elevenlabs, transcribe_audio_elevenlabs

router = APIRouter()

DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"


@router.post("/speak")
async def text_to_speech(
    payload: dict,
    user: User = Depends(get_current_user),
):
    text = payload.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    if len(text) > 5000:
        raise HTTPException(status_code=400, detail="text too long (max 5000 chars)")

    voice_id = payload.get("voice_id") or DEFAULT_VOICE_ID

    try:
        audio_bytes = await generate_audio_elevenlabs(text, voice_id=voice_id)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ElevenLabs error: {str(e)}")

    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"},
    )


@router.post("/transcribe")
async def speech_to_text(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio data received")

    try:
        text = await transcribe_audio_elevenlabs(
            audio_bytes,
            filename=file.filename or "audio.webm",
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription error: {str(e)}")

    return {"text": text, "chars": len(text)}
