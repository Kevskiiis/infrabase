#!/usr/bin/env bash
# .devcontainer/scripts/post-attach.sh
# Runs each time a client (e.g. VS Code) attaches to the running container.

set -euo pipefail

echo ""
echo "=============================================="
echo "  fastapi-vite-mui-dev container ready"
echo "=============================================="
echo "  API  (FastAPI): http://localhost:8000"
echo "  Client (Vite):    http://localhost:5173"
echo ""
if command -v git &> /dev/null && git -C /workspace rev-parse --is-inside-work-tree &> /dev/null; then
    echo "  Branch: $(git -C /workspace branch --show-current)"
fi
echo "=============================================="
echo ""