FROM ubuntu:26.04

ARG NODE_MAJOR=22

# --- Base tooling + Python (Ubuntu 26.04 ships Python 3.14 as python3) ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    git \
    curl \
    ca-certificates \
    build-essential \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# --- Node.js (Ubuntu's apt repo lags behind, so use a pinned NodeSource major) ---
RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install application dependencies in the image. Python packages intentionally
# live in the container interpreter; client packages are copied into a volume.
COPY infrabase-api/requirements.txt /tmp/infrabase-api/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages \
    -r /tmp/infrabase-api/requirements.txt

COPY infrabase-client/package.json infrabase-client/package-lock.json \
    /workspace/infrabase-client/
RUN cd /workspace/infrabase-client && npm ci

# --- Non-root user, matching typical devcontainer convention ---
ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN existing_user=$(getent passwd $USER_UID | cut -d: -f1) \
    && if [ -n "$existing_user" ] && [ "$existing_user" != "$USERNAME" ]; then \
        usermod --login $USERNAME "$existing_user" \
        && usermod --home /home/$USERNAME --move-home $USERNAME; \
    elif [ -z "$existing_user" ]; then \
        if ! getent group $USER_GID > /dev/null; then groupadd --gid $USER_GID $USERNAME; fi \
        && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME; \
    fi \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME
WORKDIR /workspace

# Ports: FastAPI/uvicorn default, Vite dev server default
EXPOSE 8000 5173