#!/usr/bin/env bash
# .devcontainer/scripts/initialize.sh
# Runs on the HOST machine, before the container is built/started.

set -e
set -u

echo "[initialize] Checking host prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "[initialize] ERROR: Docker is not installed or not on PATH." >&2
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "[initialize] ERROR: Docker daemon is not running." >&2
    exit 1
fi

# Create a local .env from the template if one doesn't exist yet, so the
# container never starts with missing config on a fresh clone.
ENV_TEMPLATE="$(dirname "${BASH_SOURCE[0]}")/../../proxbase-api/.env.example"
ENV_FILE="$(dirname "${BASH_SOURCE[0]}")/../../proxbase-api/.env"
if [ -f "$ENV_TEMPLATE" ] && [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    echo "[initialize] Created .env from .env.example — fill in real values."
fi

echo "[initialize] Host checks complete."