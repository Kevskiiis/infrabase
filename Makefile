.DEFAULT_GOAL := help

PYTHON ?= python3
NPM ?= npm
API_DIR := infrabase-api
CLIENT_DIR := infrabase-client
API_HOST ?= 0.0.0.0
API_PORT ?= 8000
CLIENT_HOST ?= 0.0.0.0
CLIENT_PORT ?= 5173

.PHONY: help install install-api install-client dev dev-api dev-client build build-client \
	lint test test-api test-client test-e2e generate-api preview

help:
	@printf "Available commands:\n"
	@printf "  make install       Install API and client dependencies\n"
	@printf "  make dev           Start API and client development servers\n"
	@printf "  make dev-api       Start the FastAPI development server\n"
	@printf "  make dev-client    Start the Vite development server\n"
	@printf "  make build         Build the client for production\n"
	@printf "  make lint          Run client linting\n"
	@printf "  make test          Run API and client unit tests\n"
	@printf "  make test-e2e      Run client end-to-end tests\n"
	@printf "  make preview       Preview the production client build\n"

install: install-api install-client

install-api:
	$(PYTHON) -m pip install -r $(API_DIR)/requirements.txt

install-client:
	cd $(CLIENT_DIR) && $(NPM) ci

dev:
	@trap 'kill 0' INT TERM EXIT; \
	(cd $(API_DIR) && $(PYTHON) -m uvicorn app.main:app --host $(API_HOST) --port $(API_PORT) --reload) & \
	(cd $(CLIENT_DIR) && $(NPM) run dev -- --host $(CLIENT_HOST) --port $(CLIENT_PORT)) & \
	wait

dev-api:
	cd $(API_DIR) && $(PYTHON) -m uvicorn app.main:app --host $(API_HOST) --port $(API_PORT) --reload

dev-client:
	cd $(CLIENT_DIR) && $(NPM) run dev -- --host $(CLIENT_HOST) --port $(CLIENT_PORT)

build: build-client

build-client:
	cd $(CLIENT_DIR) && $(NPM) run build

lint:
	cd $(CLIENT_DIR) && $(NPM) run lint

test: test-api test-client

test-api:
	cd $(API_DIR) && $(PYTHON) -m pytest -q

test-client:
	cd $(CLIENT_DIR) && $(NPM) run test

test-e2e:
	cd $(CLIENT_DIR) && $(NPM) run test:e2e

generate-api:
	cd $(CLIENT_DIR) && $(NPM) run generate:api

preview:
	cd $(CLIENT_DIR) && $(NPM) run preview -- --host $(CLIENT_HOST) --port $(CLIENT_PORT)