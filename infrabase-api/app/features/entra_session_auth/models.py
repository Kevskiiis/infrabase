from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuthenticatedUser(BaseModel):
    subject: str
    tenant_id: str
    email: str | None = None
    name: str | None = None


class SessionStatus(BaseModel):
    authenticated: bool
    user: AuthenticatedUser | None = None
    return_to: str | None = None


class AuthFailure(BaseModel):
    model_config = ConfigDict(extra="forbid")

    error: str
    code: str
    detail: str


class BrowserSession(BaseModel):
    session_id: str
    user: AuthenticatedUser
    created_at: datetime
    expires_at: datetime
