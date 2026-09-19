#!/usr/bin/env bash
# .devcontainer/scripts/post-start.sh
# Runs every time the container starts (including restarts).
# Services are intentionally started manually.

set -euo pipefail

echo "[postStart] Automatic service startup disabled."
echo "[postStart] Start services manually with: make dev-api or make dev-client"