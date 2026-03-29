from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .middleware import RateLimitMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The Intelligent Marketing Engine for Developers & Founders",
    version="1.0.0",
)

# Middleware
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
    return {
        "status": "online",
        "agents": {
            "skippy": "online",
            "snooks": "online",
            "meta": "online",
        },
    }


# --- API Routers ---
from .api import auth, skippy, snooks, meta
from .api import integrations

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(skippy.router, prefix="/api/skippy", tags=["skippy"])
app.include_router(snooks.router, prefix="/api/snooks", tags=["snooks"])
app.include_router(meta.router, prefix="/api/meta", tags=["meta"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])


# --- WebSocket ---
from .websocket import websocket_endpoint

@app.websocket("/ws/main")
async def ws_main(websocket: WebSocket, token: str = Query(...)):
    await websocket_endpoint(websocket, token=token)
