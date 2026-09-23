#!/usr/bin/env bash
# .devcontainer/scripts/post-create.sh

set -euo pipefail

echo "[postCreate] Dependencies were installed during the image build."

# The client dependencies live in a named volume, so repair ownership after
# Docker mounts it over the image directory.
CLIENT_NODE_MODULES="/workspace/proxbase-client/node_modules"
if [ -d "$CLIENT_NODE_MODULES" ]; then
	sudo chown -R "$(id -u):$(id -g)" "$CLIENT_NODE_MODULES"
fi