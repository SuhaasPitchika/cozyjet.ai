from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .middleware import RateLimitMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The Intelligent Marketing Engine for Developers & Founders",
    version="1.0.0"
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

from .api import auth, skippy, snooks, meta, integrations, tune

# --- Sub-Routers ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(skippy.router, prefix="/api/skippy", tags=["Skippy Agent"])
app.include_router(snooks.router, prefix="/api/snooks", tags=["Snooks Agent"])
app.include_router(meta.router, prefix="/api/meta", tags=["Meta Agent"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(tune.router, prefix="/api/tune", tags=["Voice Tuning"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "CozyJet API",
        "description": "The Intelligent Marketing Engine for Solo Creators",
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": str(datetime.utcnow())}
