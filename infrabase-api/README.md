## Entra session authentication

Install the pinned dependencies and configure the API through environment variables. At minimum, set `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`, `ENTRA_REDIRECT_URI`, `FRONTEND_ORIGIN`, and `REDIS_URL`. The backend uses Authlib for authorization-code exchange and JWKS validation, and Redis for opaque 12-hour browser sessions.

```bash
python3 -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run the isolated auth checks with:

```bash
pytest -q
```

Tests use Redis and Entra doubles; production credentials must never be placed in test files, URLs, logs, or client state.
