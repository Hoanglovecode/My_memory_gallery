import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

async def test_apis():
    print("=== KIỂM TRA GEMINI API ===")
    async with httpx.AsyncClient() as client:
        gemini_res = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{"role": "user", "parts": [{"text": "Xin chào"}]}]
            }
        )
        print(f"Gemini Status: {gemini_res.status_code}")
        if gemini_res.status_code != 200:
            print(f"Gemini Error Body: {gemini_res.text}")
        else:
            print("Gemini OK!")

    print("\n=== KIỂM TRA ELEVENLABS API ===")
    async with httpx.AsyncClient() as client:
        eleven_res = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "text": "Chào bạn, đây là kiểm tra.",
                "model_id": "eleven_multilingual_v2"
            }
        )
        print(f"ElevenLabs Status: {eleven_res.status_code}")
        if eleven_res.status_code != 200:
            print(f"ElevenLabs Error Body: {eleven_res.text}")
        else:
            print("ElevenLabs OK!")

asyncio.run(test_apis())
