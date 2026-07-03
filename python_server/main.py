from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from voice_chat import router as voice_chat_router

app = FastAPI(title="Voice Chat Backend")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Reply-Text"], # Need to expose the custom header so the frontend can read it
)

app.include_router(voice_chat_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Voice Chat Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
