# BackendFlow AI — Production Deployment Guide

This document details the configuration, security setup, and execution commands required to deploy BackendFlow AI to production.

---

## 1. System Architecture Overview

BackendFlow AI consists of:
1. **Next.js Frontend**: React 19 / App Router interface for visual API building, architecture analysis topology, and production readiness audits.
2. **FastAPI Backend Engine**: Async Python REST API providing authentication, project management, API design generation, architectural analysis, and rule-based audit evaluation.
3. **AI LLM Abstraction Layer**: Pluggable provider system supporting Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), and deterministic `mock` mode for offline operation.
4. **Database Layer**: SQLAlchemy ORM supporting SQLite (local development) and PostgreSQL (production deployment).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` in the project root (or inside `backend/` and `frontend/`):

```bash
cp .env.example .env
```

### Key Environment Variables

| Variable | Description | Default | Required for Production |
|---|---|---|---|
| `ENV` | Environment mode (`development` \| `production` \| `testing`) | `development` | Yes |
| `SECRET_KEY` | Secret key for signing JWT tokens | `dev_secret_key...` | Yes (Must be random min 32 chars) |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./backendflow.db` | Yes (`postgresql://...` for production) |
| `AI_PROVIDER` | LLM Provider (`gemini` \| `openai` \| `mock`) | `mock` | Yes (`gemini` or `openai`) |
| `AI_API_KEY` | API Key for Gemini or OpenAI | `""` | Yes (if `AI_PROVIDER` != `mock`) |
| `AI_MODEL` | Target AI Model | `gemini-2.5-flash` | No |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:3000` | Yes (Frontend production domain) |
| `NEXT_PUBLIC_API_URL` | Frontend URL targeting Backend API | `http://localhost:8000/api` | Yes |

> **SECURITY NOTICE**: Never commit `.env` or real API keys to version control.

---

## 3. Deployment Methods

### Option A: Docker Compose (Recommended)

Orchestrates PostgreSQL, FastAPI Backend, and Next.js Frontend in isolated containers.

```bash
# 1. Build and launch all services in detached mode
docker-compose up -d --build

# 2. Inspect logs
docker-compose logs -f

# 3. Check container health
docker-compose ps
```

The application will be accessible at:
- **Frontend Platform**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000/api`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`

---

### Option B: Manual Host Deployment

#### 1. Backend Service (FastAPI + Uvicorn)

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start production Uvicorn server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### 2. Frontend Platform (Next.js)

```bash
cd frontend

# Install Node dependencies
npm install

# Build production assets
npm run build

# Start production Next.js server
npm run start
```

---

## 4. Verification & Testing

To verify the deployment status and test suite:

### Backend Tests (pytest)
```bash
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 5. Security & Operational Hardening Checklist

- [x] Passwords hashed using `bcrypt` with unique salts.
- [x] JWT access tokens checked on all protected endpoints via Bearer headers.
- [x] AI Providers handle timeouts (30s) and return safe user-facing error messages on quota/auth errors.
- [x] Safe JSON response cleaner handles markdown blocks (` ```json ... ``` `) and malformed LLM outputs.
- [x] API parameters strictly validated using Pydantic v2 schemas.
- [x] API Key never exposed to client/browser layer.
