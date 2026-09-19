"""
Application entrypoint.

Run with:
    uvicorn main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import AuthError, auth_exception_handler, validation_exception_handler
from app.core.session_store import SessionStore, redis_lifespan
from app.features.entra_session_auth.router import router as auth_router

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    application.state.settings = settings
    async with redis_lifespan() as redis:
        application.state.session_store = SessionStore(redis)
        yield


app = FastAPI(title="Infrabase API", version="0.1.0", lifespan=lifespan)
app.add_exception_handler(AuthError, auth_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Adjust allow_origins for production — "*" is fine for local dev only.

settings = get_settings()
ALLOWED_ORIGINS = settings.allowed_origins or [settings.frontend_origin, "http://localhost:3000", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["health"])
def health_check() -> bool:
    """Simple liveness check. Returns True if the service is up."""
    return True

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth_router)

