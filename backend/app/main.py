from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The Intelligent Marketing Engine for Developers & Founders",
    version="1.0.0"
)

# CORS Implementation
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "online", "agents": {"skippy": "online", "flippo": "online", "snooks": "online", "meta": "online"}}

from .api import auth, skippy, snooks, meta

# --- Sub-Routers ---
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(skippy.router, prefix="/api/skippy", tags=["skippy"])
app.include_router(snooks.router, prefix="/api/snooks", tags=["snooks"])
app.include_router(meta.router, prefix="/api/meta", tags=["meta"])
