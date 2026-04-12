"""
Audio API — ElevenLabs TTS and STT endpoints.
POST /api/audio/speak       — text → speech (MP3 bytes)
POST /api/audio/transcribe  — audio upload → text
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response

from ..dependencies import get_current_user
from ..models.user import User
from ..services.model_router import call_elevenlabs, call_elevenlabs_transcribe

router = APIRouter()


@router.post("/speak")
async def text_to_speech(
    payload: dict,
    user: User = Depends(get_current_user),
):
    text = payload.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    if len(text) > 5000:
        raise HTTPException(status_code=400, detail="text exceeds 5000 character limit")

    voice_id = payload.get("voice_id")

    try:
        audio_bytes = await call_elevenlabs(text, voice_id=voice_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Audio generation failed: {str(e)}")

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
        text = await call_elevenlabs_transcribe(
            audio_bytes,
            filename=file.filename or "audio.webm",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {str(e)}")

    return {"text": text, "chars": len(text)}
