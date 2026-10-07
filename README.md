# BackendFlow AI — Visual Backend Engineering Platform

BackendFlow AI is a visual backend engineering platform designed for building, testing, and managing high-performance microservices powered by FastAPI, Pydantic, and Next.js.

---

## 🏗️ Architecture Overview

```
backendflow-ai/
├── frontend/               # Next.js App Router + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/           # App Router pages (Dashboard, Projects, API Builder, Schema, Code, Test Console, 3D Twin, Load Sim, Settings)
│   │   ├── components/    # Reusable Design System (Button, Card, Badge, Modal, Tabs, StatCard, Sidebar, TopBar)
│   │   ├── lib/           # REST API client & Mock Data
│   │   └── types/         # TypeScript interface definitions
│   └── package.json
│
├── backend/                # FastAPI + SQLAlchemy + SQLite Backend
│   ├── app/
│   │   ├── main.py        # FastAPI app & CORS configuration
│   │   ├── core/          # App settings & JWT security (bcrypt + PyJWT)
│   │   ├── db/            # SQLAlchemy SQLite engine & session generator
│   │   ├── models/        # SQLAlchemy DB models (User, Project)
│   │   ├── schemas/       # Pydantic request/response validation schemas
│   │   ├── services/      # Auth & Project CRUD business logic
│   │   └── api/           # REST endpoints (/api/health, /api/auth, /api/projects)
│   ├── tests/             # Pytest suite with in-memory SQLite (health, auth, project CRUD)
│   ├── .env.example       # Environment configuration template
│   └── requirements.txt   # Python dependencies
│
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Running the FastAPI Backend

#### Prerequisites
- Python 3.10+ installed

#### Setup & Run
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations / startup engine
python -m uvicorn app.main:app --reload --port 8000
```

The backend server will start at:
- **API URL**: `http://localhost:8000/api`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

#### Running Backend Tests
```bash
# Run pytest test suite
python -m pytest tests -v
```

---

### 2. Running the Database (SQLite)

- By default, the backend uses **SQLite** (`backendflow.db`).
- The database file is automatically created in `backend/backendflow.db` on first launch when `uvicorn` starts.
- Tables (`users`, `projects`) are automatically initialized using SQLAlchemy.

---

### 3. Running the Next.js Frontend

#### Setup & Run
```bash
# Navigate to frontend
cd frontend

# Install Node.js dependencies
npm install

# Start Next.js development server
npm run dev
```

The frontend application will start at:
- **Frontend App**: `http://localhost:3000`

---

## 🔐 REST API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/health` | `GET` | Service status & version | No |
| `/api/auth/register` | `POST` | Register a new user | No |
| `/api/auth/login` | `POST` | Authenticate & get JWT bearer token | No |
| `/api/auth/me` | `GET` | Get current user profile | Yes (`Bearer <token>`) |
| `/api/projects` | `GET` | List all user projects | Yes (`Bearer <token>`) |
| `/api/projects` | `POST` | Create a new backend project | Yes (`Bearer <token>`) |
| `/api/projects/{id}` | `GET` | Get project details by ID | Yes (`Bearer <token>`) |
| `/api/projects/{id}` | `PUT` | Update project by ID | Yes (`Bearer <token>`) |
| `/api/projects/{id}` | `DELETE` | Delete project by ID | Yes (`Bearer <token>`) |
