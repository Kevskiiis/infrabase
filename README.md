# Proxbase

A full-stack internal platform prototype focused on secure session-based authentication, modern navigation, and a clean administrative experience for cloud infrastructure workflows.

This project demonstrates a production-minded architecture with a FastAPI backend, a React + TypeScript frontend, Microsoft Entra authentication, and a structured multi-service repository layout designed for maintainability and extensibility.

## Overview

Proxbase is designed as a secure, internal-facing application shell for infrastructure operations and user access management. The long-term goal is to provide a central interface for managing infrastructure workloads, secure access, and deployment automation across a self-hosted environment.

The project emphasizes:

- secure authentication and session handling
- single-page frontend experience with protected routes
- clean, modern navigation patterns
- modular backend feature organization
- test-driven validation for auth and session behaviors
- future deployment workflows for infrastructure automation on Proxmox hosts

The core vision is to support a deployment model where infrastructure resources are provisioned and managed through automated templates, with Proxmox serving as the hypervisor platform and Packer templates enabling repeatable VM image creation.

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
- planned infrastructure deployment workflows using Proxmox and Packer templates

## Intended Use Case

This project is intended to evolve into an internal platform for provisioning and managing infrastructure in a self-hosted environment. The target model is a Proxmox-based infrastructure layer where automated image and VM workflows are driven by Packer templates, allowing reproducible deployment of standardized environments.

In practice, the application will serve as the operational front end for teams managing infrastructure tasks, access control, and deployment activity in a consistent and repeatable way.

## Repository Structure

```text
/
├── README.md
├── proxbase-api/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── proxbase-client/
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
cd proxbase-api
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
cd proxbase-client
npm install
npm run dev
```

### Testing

Backend:

```bash
cd proxbase-api
pytest -q
```

Frontend:

```bash
cd proxbase-client
npm run test
```

## Project Status

This project is still a work in progress and is being actively developed. It is intended to demonstrate practical engineering decisions relevant to enterprise software development, including authentication, routing, session management, and a maintainable frontend/backend split. It is not yet a production-grade deployment and continues to evolve as features and validation mature.

## Professional Summary

This repository reflects a strong emphasis on:

- secure application architecture
- modern frontend craftsmanship
- backend API discipline
- test coverage and validation
- clear separation of concerns
- professional project structure suitable for portfolio or client-facing review

For a deeper breakdown of requirements and implementation planning, see the design artifacts in the specs directory.
