from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware

# This is the variable Railway is looking for!
app = FastAPI(
    title="cozyjet-ai",
    description="The Intelligent Marketing Engine",
    version="2.0.0",
)

# Basic Health Check
@app.get("/health")
async def health_check():
    return {"status": "online"}

# --- Your existing routers should go below here ---
# Example: 
# from .api import auth
# app.include_router(auth.router, prefix="/api/auth")