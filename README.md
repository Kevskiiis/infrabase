# Infrabase

A full-stack internal platform prototype focused on secure session-based authentication, modern navigation, and a clean administrative experience for cloud infrastructure workflows.

This project demonstrates a production-minded architecture with a FastAPI backend, a React + TypeScript frontend, Microsoft Entra authentication, and a structured multi-service repository layout designed for maintainability and extensibility.

## Overview

Infrabase is designed as a secure, internal-facing application shell for infrastructure operations and user access management. The project emphasizes:

- secure authentication and session handling
- single-page frontend experience with protected routes
- clean, modern navigation patterns
- modular backend feature organization
- test-driven validation for auth and session behaviors

## Architecture

The repository is split into two primary application layers:

- Backend: FastAPI service for auth, session management, and API logic
- Frontend: React + Vite application with TypeScript and MUI components

### Backend

The API layer includes:

- Microsoft Entra OAuth/OIDC integration
- session-based authentication flow
- protected route enforcement
- centralized config, security, and logging setup
- contract and unit test coverage for auth behavior

### Frontend

The client layer includes:

- authenticated app shell and navigation
- protected route guarding
- session-aware UI states
- modern sidebar layout and responsive navigation patterns
- API client and feature-based organization for scalability

## Tech Stack

- Python 3.x
- FastAPI
- Redis
- Authlib
- React 19
- TypeScript
- Vite
- Material UI
- Pytest
- Vitest
- Playwright

## Key Features

- Entra-backed sign-in flow
- secure browser session lifecycle management
- protected routing and auth gating
- centralized configuration and environment-based deployment setup
- structured test suite covering authentication contracts and service logic
- clean, component-driven frontend architecture

## Repository Structure

```text
/
├── README.md
├── infrabase-api/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── infrabase-client/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
├── specs/
│   ├── 001-entra-session-auth/
│   └── 002-primary-navigation-sidebar/
└── Makefile
```

## Getting Started

### Prerequisites

- Python environment for the API
- Node.js and npm for the frontend
- Redis instance for session persistence
- Microsoft Entra application credentials

### Backend

From the repository root:

```bash
cd infrabase-api
python3 -m pip install -r requirements.txt
```

Set the required environment variables before starting the API. At minimum:

- ENTRA_TENANT_ID
- ENTRA_CLIENT_ID
- ENTRA_CLIENT_SECRET
- ENTRA_REDIRECT_URI
- FRONTEND_ORIGIN
- REDIS_URL

Then run:

```bash
uvicorn app.main:app --reload
```

### Frontend

From the repository root:

```bash
cd infrabase-client
npm install
npm run dev
```

### Testing

Backend:

```bash
cd infrabase-api
pytest -q
```

Frontend:

```bash
cd infrabase-client
npm run test
```

## Project Status

This project is an active prototype and design-driven implementation of secure internal application workflows. It is structured to demonstrate practical engineering decisions relevant to enterprise software development, including authentication, routing, session management, and a maintainable frontend/backend split.

## Professional Summary

This repository reflects a strong emphasis on:

- secure application architecture
- modern frontend craftsmanship
- backend API discipline
- test coverage and validation
- clear separation of concerns
- professional project structure suitable for portfolio or client-facing review

For a deeper breakdown of requirements and implementation planning, see the design artifacts in the specs directory.
