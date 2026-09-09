#!/usr/bin/env bash
# .devcontainer/scripts/post-start.sh
# Runs every time the container starts (including restarts).
# Must return quickly — background anything long-running.

set -euo pipefail

WORKSPACE_ROOT="/workspace"
API_DIR="$WORKSPACE_ROOT/infrabase-api"
CLIENT_DIR="$WORKSPACE_ROOT/infrabase-client"
LOG_DIR="$WORKSPACE_ROOT/.devcontainer/.logs"
mkdir -p "$LOG_DIR"

echo "[postStart] Starting background dev services..."

# Backend (FastAPI/uvicorn) — only start if not already running.
if [ -f "$API_DIR/main.py" ] && ! pgrep -f "uvicorn" > /dev/null; then
    (cd "$API_DIR" && \
        nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
        > "$LOG_DIR/backend.log" 2>&1 &)
    echo "[postStart] Backend starting — logs: $LOG_DIR/backend.log"
elif [ ! -f "$API_DIR/main.py" ]; then
    echo "[postStart] Backend skipped: $API_DIR/main.py not found."
fi

# Frontend (Vite) — only start if not already running.
if ! pgrep -f "vite" > /dev/null; then
    (cd "$CLIENT_DIR" && \
        nohup npm run dev -- --host 0.0.0.0 \
        > "$LOG_DIR/frontend.log" 2>&1 &)
    echo "[postStart] Frontend starting — logs: $LOG_DIR/frontend.log"
fi

echo "[postStart] Done."