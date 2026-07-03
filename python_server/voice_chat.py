from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import httpx, os, urllib.parse, traceback
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
sessions: dict[str, list] = {}

GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID          = "cgSgspJ2msm6clMCkdW9"

SYSTEM_PROMPT = """Bạn là trợ lý AI trong app Memories.
Trợ lý trả lời bằng tiếng Việt, tự nhiên, tối đa 30 từ. Không dùng markdown."""

class ChatRequest(BaseModel):
    message: str
    sessionId: str

@router.post("/voice/chat")
async def voice_chat(req: ChatRequest):
    # ✅ Log ngay khi có request — để biết backend nhận được không
    print(f"\n[VoiceChat] Nhận request: '{req.message}' | session: {req.sessionId}")
    print(f"[VoiceChat] GEMINI_KEY set: {bool(GEMINI_API_KEY)} | ELEVEN_KEY set: {bool(ELEVENLABS_API_KEY)}")

    try:
        # ── Step 1: Gemini ──────────────────────────────────────────────
        history = sessions.get(req.sessionId, [])
        history.append({"role": "user", "parts": [{"text": req.message}]})

        async with httpx.AsyncClient(timeout=15) as client:
            gemini_res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
                json={
                    "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                    "contents": history
                }
            )
        
        print(f"[VoiceChat] Gemini status: {gemini_res.status_code}")
        
        if gemini_res.status_code != 200:
            print(f"[VoiceChat] Gemini error: {gemini_res.text}")
            return JSONResponse(status_code=500, content={"error": "Gemini failed", "detail": gemini_res.text})

        res_json = gemini_res.json()
        candidates = res_json.get("candidates", [])
        if not candidates:
            reply_text = "Xin lỗi, tôi không thể xử lý yêu cầu này."
        else:
            try:
                reply_text = candidates[0]["content"]["parts"][0]["text"].strip()
            except (KeyError, IndexError):
                reply_text = "Xin lỗi, tớ chưa hiểu ý bạn lắm, chúng ta đổi chủ đề nhé?"

        print(f"[VoiceChat] Gemini reply: {reply_text}")

        history.append({"role": "model", "parts": [{"text": reply_text}]})
        sessions[req.sessionId] = history[-20:]

        # ── Step 2: ElevenLabs ──────────────────────────────────────────
        async with httpx.AsyncClient(timeout=30) as client:
            eleven_res = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
                headers={
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "text": reply_text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                }
            )

        print(f"[VoiceChat] ElevenLabs status: {eleven_res.status_code}")
        
        if eleven_res.status_code != 200:
            print(f"[VoiceChat] ElevenLabs error: {eleven_res.text}")
            return JSONResponse(status_code=500, content={"error": "ElevenLabs failed", "detail": eleven_res.text})

        from fastapi.responses import Response
        return Response(
            content=eleven_res.content,
            media_type="audio/mpeg",
            headers={"X-Reply-Text": urllib.parse.quote(reply_text)}
        )

    except Exception as e:
        # ✅ In toàn bộ traceback ra terminal — biết crash ở dòng nào
        print(f"[VoiceChat] ❌ EXCEPTION: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
