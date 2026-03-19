# TPRM Backend

FastAPI backend for the Third-Party Risk Management platform.

---

## Stack
- **FastAPI** — web framework
- **PostgreSQL** — database
- **SQLAlchemy** — ORM (Python objects → SQL)
- **Alembic** — database migrations
- **Pydantic v2** — request/response validation
- **python-jose** — JWT authentication
- **passlib** — password hashing

---

## Setup

### 1. Create the PostgreSQL database

```bash
psql -U postgres
CREATE USER tprm_user WITH PASSWORD 'tprm_pass';
CREATE DATABASE tprm_db OWNER tprm_user;
\q
```

### 2. Create a virtual environment and install dependencies

```bash
cd tprm-backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if your DB credentials differ
```

### 4. Run the server

```bash
uvicorn main:app --reload --port 8000
```

On first startup the server will:
- Create all 15 database tables automatically
- Seed all mock data (vendors, agents, controls, risks, etc.)
- Print: `✅  Database seeded successfully.`

---

## Running both servers together

**Terminal 1 — Backend:**
```bash
cd tprm-backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd TPRM-FRONTEND-dev
npm install
npm run dev
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`.
Open `http://localhost:5173` — the frontend will talk to the real backend.

---

## Default login credentials

| Email | Password | Role |
|-------|----------|------|
| priya@abc.co | password123 | Risk Manager |
| raj@abc.co | password123 | Compliance Officer |
| anita@abc.co | password123 | DPO |
| kiran@abc.co | password123 | Viewer |
| it-admin@abc.co | password123 | Admin |

---

## API Documentation

Interactive Swagger UI available at:
```
http://localhost:8000/api/docs
```

---

## Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Current user |
| GET | /api/vendors | List all vendors |
| POST | /api/vendors | Create vendor |
| PATCH | /api/vendors/:id | Update vendor |
| GET | /api/agents | List all agents |
| GET | /api/agents/:id/logs/stream | **SSE** live log stream |
| GET | /api/agents/:id/tasks?view=list | Agent tasks |
| GET | /api/agents/:id/timeline | Agent timeline |
| GET | /api/controls | List controls |
| PATCH | /api/controls/:id/toggle | Toggle active state |
| GET | /api/risks | Risk events |
| GET | /api/dashboard/summary | All dashboard KPIs |
| GET | /api/audit-logs | Audit log with filters |
| POST | /api/documents | Upload document |
| GET | /api/library/graph | Full graph snapshot |
| PATCH | /api/library/suppliers/:id | Update node position |
| GET | /api/library/healthcare | Healthcare lifecycle view |
| GET | /api/roles/users | All users |
| PATCH | /api/roles/users/:id | Change role |
| GET | /api/settings | Org settings |
| PATCH | /api/settings | Update settings |

---

## SSE Log Stream

The agent log stream replaces the frontend's `useAgentLogStream` hook.

Connect from the frontend:
```typescript
const source = new EventSource(`/api/agents/${agentId}/logs/stream`);
source.onmessage = (e) => {
  const log = JSON.parse(e.data);
  // { id, time, type, message, detail }
};
```

The stream:
1. First yields all stored logs from the database
2. Then emits a new live entry every 3 seconds from the agent's queue

---

## Project structure

```
tprm-backend/
├── main.py                    # Entry point
├── requirements.txt
├── .env.example
├── alembic.ini
└── app/
    ├── config.py              # Settings from .env
    ├── database.py            # Engine + get_db()
    ├── dependencies.py        # JWT auth dependency
    ├── seed.py                # Mock data seeder
    ├── models/                # SQLAlchemy ORM tables
    ├── schemas/               # Pydantic request/response
    ├── routers/               # FastAPI route handlers
    ├── services/              # Business logic
    │   ├── audit.py           # Auto audit logging
    │   ├── agent_stream.py    # SSE generator
    │   ├── risk_scoring.py    # Risk calculation
    │   └── dashboard.py      # KPI aggregation
    ├── migrations/            # Alembic versions
    └── uploads/               # Uploaded documents
```
