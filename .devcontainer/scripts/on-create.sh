#!/usr/bin/env bash
# .devcontainer/scripts/on-create.sh
# Runs ONCE, the first time the container is created from the image.
# Best for one-time OS-level setup that isn't worth baking into the Dockerfile.

set -euxo pipefail

echo "[onCreate] Running one-time container setup..."

# Trust the workspace dir for git (avoids "dubious ownership" errors when
# bind-mounting a host repo owned by a different uid).
git config --global --add safe.directory /workspace

echo "[onCreate] One-time setup complete."
