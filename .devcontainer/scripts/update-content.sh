#!/usr/bin/env bash
# .devcontainer/scripts/update-content.sh
# Runs on creation AND whenever container content is refreshed
# (e.g. prebuilds, or a repo re-sync without a full rebuild).
# Keep this idempotent and cheap — it can run more than once.

set -euxo pipefail

WORKSPACE_ROOT="/workspace"

if [ -f "$WORKSPACE_ROOT/.gitmodules" ]; then
    echo "[updateContent] Syncing git submodules..."
    git -C "$WORKSPACE_ROOT" submodule update --init --recursive
fi

echo "[updateContent] Done."