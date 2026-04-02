from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .middleware import RateLimitMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The Intelligent Marketing Engine for Developers & Founders",
    version="2.0.0",
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    from .config import settings
    return {
        "status": "online",
        "version": "2.0.0",
        "agents": {
            "skippy": "online",
            "snooks": "online",
            "meta": "online",
        },
        "ai_configured": bool(settings.OPEN_ROUTER),
        "elevenlabs_configured": bool(getattr(settings, "ELEVENLABS_API_KEY", "")),
    }


from .api import auth, skippy, snooks, meta, integrations, analytics, tune, audio

app.include_router(auth.router,         prefix="/api/auth",         tags=["auth"])
app.include_router(skippy.router,       prefix="/api/skippy",       tags=["skippy"])
app.include_router(snooks.router,       prefix="/api/snooks",       tags=["snooks"])
app.include_router(meta.router,         prefix="/api/meta",         tags=["meta"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])
app.include_router(analytics.router,    prefix="/api/analytics",    tags=["analytics"])
app.include_router(tune.router,         prefix="/api/tune",         tags=["tune"])
app.include_router(audio.router,        prefix="/api/audio",        tags=["audio"])


from .websocket import websocket_endpoint

@app.websocket("/ws/main")
async def ws_main(websocket: WebSocket, token: str = Query(...)):
    await websocket_endpoint(websocket, token=token)
