# TPRM Backend Integration Documentation

**Author:** Claude AI Assistant
**Date:** March 19, 2026
**Project:** Third-Party Risk Management (TPRM) Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [API Client Setup](#api-client-setup)
5. [Data Flow Pattern](#data-flow-pattern)
6. [CRUD Operations Implementation](#crud-operations-implementation)
7. [Feature-by-Feature Integration](#feature-by-feature-integration)
8. [Key Fixes Made](#key-fixes-made)
9. [File Changes Summary](#file-changes-summary)

---

## Overview

This document explains how the React frontend was connected to the FastAPI backend for the TPRM platform. The integration involved:

- Setting up JWT authentication with token persistence
- Creating a centralized API client with error handling
- Implementing CRUD operations for all features (Agents, Controls, Vendors, etc.)
- Fixing data persistence issues where changes weren't being saved
- Disabling mock data fallbacks for production use

---

## Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 6 (build tool)
- Zustand (state management with persistence)
- React Router v7 (routing)
- Tailwind CSS + shadcn/ui (styling)

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL/SQLite (database)
- JWT (authentication)
- Pydantic (data validation)

### High-Level Flow

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     SQLAlchemy    ┌──────────┐
│   React     │ ◄──────────────► │   FastAPI   │ ◄───────────────► │ Database │
│   Frontend  │                    │   Backend   │                    │          │
└─────────────┘                    └─────────────┘                    └──────────┘
      │                                   │
      │ Zustand Store                     │ Pydantic Schemas
      │ (Auth, UI State)                  │ (Validation)
      ▼                                   ▼
 localStorage                        JWT Tokens
 (Token Persistence)                 (Authentication)
```

---

## Authentication System

### How Authentication Works

1. **User logs in** → Frontend sends `POST /auth/login` with email/password
2. **Backend validates** → Returns JWT `access_token`
3. **Frontend stores token** → Saved in Zustand store + localStorage
4. **Subsequent requests** → Include `Authorization: Bearer <token>` header
5. **Protected routes** → Check for valid token before rendering

### Key Files

#### Backend: `Backend/app/routers/auth.py`

```python
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer"}
```

#### Frontend: `Frontend/src/stores/authStore.ts`

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,  // Critical for preventing redirect loops
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'tprm-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);
```

### The `_hasHydrated` Fix

**Problem:** Zustand's `persist` middleware loads data from localStorage asynchronously. Before hydration completes, `token` is `null`, causing the app to redirect to login even for authenticated users.

**Solution:** Added `_hasHydrated` flag that starts as `false` and becomes `true` only after localStorage data is loaded. Components wait for this flag before making routing decisions.

```typescript
// In ProtectedRoute.tsx
if (!_hasHydrated) {
  return <Loader2 className="animate-spin" />; // Show loading spinner
}
if (!token || !user) {
  return <Navigate to="/login" />; // Only redirect after hydration
}
```

---

## API Client Setup

### The Centralized API Client

**File:** `Frontend/src/lib/api.ts`

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    ...options,
  });

  // Handle 401 - session expired
  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorData.detail || 'API Error');
  }

  return res.json();
}

export const api = {
  get:    <T>(url: string, opts?) => request<T>(url, { ...opts, method: 'GET' }),
  post:   <T>(url: string, body, opts?) => request<T>(url, { ...opts, method: 'POST', body }),
  patch:  <T>(url: string, body, opts?) => request<T>(url, { ...opts, method: 'PATCH', body }),
  delete: <T>(url: string, opts?) => request<T>(url, { ...opts, method: 'DELETE' }),
};
```

### Why This Pattern?

1. **Centralized auth handling** - Token is automatically added to every request
2. **Consistent error handling** - All API errors are handled uniformly
3. **Type safety** - Generic types ensure proper TypeScript inference
4. **Easy to use** - Simple `api.get('/endpoint')` calls throughout the app

---

## Data Flow Pattern

### The `withFallback` Pattern

**File:** `Frontend/src/lib/apiUtils.ts`

This utility wraps API calls and provides fallback to mock data when needed:

```typescript
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T | (() => T),
  label = 'API'
): Promise<T> {
  // If mock mode is enabled, skip API entirely
  if (USE_MOCK_DATA) {
    return typeof mockData === 'function' ? mockData() : mockData;
  }

  // Otherwise, make the real API call
  return await apiCall();
}
```

### Case Conversion Utilities

Backend uses `snake_case`, frontend uses `camelCase`. These utilities convert between them:

```typescript
// API Response: { user_name: "John", created_at: "2024-01-01" }
// After toCamelCase: { userName: "John", createdAt: "2024-01-01" }

export function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(value);
      return acc;
    }, {}) as T;
  }
  return obj as T;
}

export function toSnakeCase<T>(obj: unknown): T {
  // Reverse conversion for sending data to API
  // { userName: "John" } → { user_name: "John" }
}
```

---

## CRUD Operations Implementation

### Pattern Used for Each Feature

Each feature follows this consistent pattern:

```
Feature/
├── types.ts           # TypeScript interfaces
├── services/
│   └── feature.data.ts    # API calls + mock data
├── pages/
│   └── FeaturePage.tsx    # UI component
└── components/
    └── ...                # Reusable components
```

### Example: Agents Feature

#### 1. Backend Endpoints (`Backend/app/routers/agents.py`)

```python
# LIST - Get all agents
@router.get("", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Agent).order_by(Agent.name).all()

# CREATE - Create new agent
@router.post("", response_model=AgentResponse, status_code=201)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = Agent(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

# READ - Get single agent
@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

# UPDATE - Update agent
@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: str, payload: AgentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(agent, key, value)

    db.commit()
    db.refresh(agent)
    return agent

# DELETE - Delete agent
@router.delete("/{agent_id}", status_code=204)
def delete_agent(agent_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(agent)
    db.commit()
```

#### 2. Frontend Service (`Frontend/src/features/agents/services/agents.data.ts`)

```typescript
import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';

// FETCH ALL
export async function getAgents(): Promise<Agent[]> {
  return withFallback(
    async () => toCamelCase(await api.get('/agents')),
    MOCK_AGENTS,
    'agents'
  );
}

// CREATE
export async function createAgent(input: AgentCreateInput): Promise<Agent> {
  const payload = toSnakeCase(input);
  const response = await api.post<unknown>('/agents', payload);
  return toCamelCase<Agent>(response);
}

// UPDATE
export async function updateAgent(id: string, input: AgentUpdateInput): Promise<Agent> {
  const payload = toSnakeCase(input);
  const response = await api.patch<unknown>(`/agents/${id}`, payload);
  return toCamelCase<Agent>(response);
}

// DELETE
export async function deleteAgent(id: string): Promise<void> {
  await api.delete(`/agents/${id}`);
}
```

#### 3. Frontend Page (`Frontend/src/features/agents/pages/AgentsPage.tsx`)

```typescript
// Fetch on mount
useEffect(() => {
  getAgents()
    .then(setAgents)
    .catch(console.error);
}, []);

// Create handler
const handleCreate = async () => {
  const agent = await createAgent({
    name: name.trim(),
    status: 'active',
    // ... other fields
  });
  setAgents(prev => [...prev, agent]);
  toast.success('Agent created!');
};

// Update handler
const handleUpdateAgent = async (updated: Agent) => {
  // Optimistic update
  setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));

  // Persist to backend
  await updateAgent(updated.id, {
    name: updated.name,
    avatarSeed: updated.avatarSeed,
    // ... other fields
  });
};
```

---

## Feature-by-Feature Integration

### Features Integrated

| Feature | Endpoints | Status |
|---------|-----------|--------|
| **Agents** | GET, POST, PATCH, DELETE | ✅ Complete |
| **Controls** | GET, POST, PATCH, DELETE, PATCH/toggle | ✅ Complete |
| **Vendors** | GET, POST, PATCH, DELETE | ✅ Complete |
| **Dashboard** | GET (widgets, stats) | ✅ Complete |
| **Audit Logs** | GET | ✅ Complete |
| **Documents** | GET | ✅ Complete |
| **Risk Assessment** | GET | ✅ Complete |
| **Library** | GET | ✅ Complete |
| **Templates** | GET | ✅ Complete |
| **Settings** | GET, PATCH | ✅ Complete |
| **Auth** | POST /login, /register, GET /me | ✅ Complete |

---

## Key Fixes Made

### Fix 1: Infinite Reload Loop on Login Page

**Problem:** Login page kept reloading infinitely.

**Root Cause:** Zustand's persist middleware loads data asynchronously. Before hydration:
- `token` was `null`
- `useEffect` saw no token → redirected to `/login`
- On `/login`, another `useEffect` checked for token → found none → stayed
- But then hydration completed → token appeared → redirected to `/`
- This created a loop

**Solution:** Added `_hasHydrated` flag:

```typescript
// Before any routing decision
if (!_hasHydrated) {
  return <LoadingSpinner />;
}
```

### Fix 2: "Session Expired" on Every Login

**Problem:** After entering correct credentials, user got "Session expired" error.

**Root Cause:** The login flow was:
1. Call `authApi.login()` → get `access_token`
2. Call `authApi.me()` to get user data
3. But `authApi.me()` tried to read token from store (which wasn't updated yet)
4. No token → 401 error → "Session expired"

**Solution:** Modified `authApi.me()` to accept optional token parameter:

```typescript
// In LoginPage.tsx
const { access_token } = await authApi.login(email, password);
const userData = await authApi.me(access_token);  // Pass token directly
login(access_token, userData);  // Now update store
```

### Fix 3: Data Not Persisting

**Problem:** Created agents/controls didn't appear in list after page reload. Avatar changes reset.

**Root Cause:** The frontend was only updating local React state, not calling the backend API.

```typescript
// OLD CODE - Only local state update
const handleCreate = () => {
  setAgents(prev => [...prev, newAgent]);  // Lost on reload!
};
```

**Solution:** Added actual API calls:

```typescript
// NEW CODE - Calls backend API
const handleCreate = async () => {
  const agent = await createAgent(data);  // Saved to database
  setAgents(prev => [...prev, agent]);
};
```

### Fix 4: Mock Data Always Being Used

**Problem:** Even with backend running, app used mock data.

**Root Cause:** `withFallback` was catching API errors and silently falling back to mock data.

**Solution:** When `VITE_USE_MOCK_DATA=false`, let API errors propagate:

```typescript
export async function withFallback<T>(apiCall, mockData, label): Promise<T> {
  if (USE_MOCK_DATA) {
    return mockData;
  }
  // Don't catch errors - let them propagate
  return await apiCall();
}
```

---

## File Changes Summary

### Backend Files Modified/Created

| File | Changes |
|------|---------|
| `app/routers/agents.py` | Added POST, PATCH, DELETE endpoints |
| `app/schemas/agent.py` | Added AgentCreate, AgentUpdate schemas |
| `app/routers/controls.py` | Already had full CRUD |
| `app/routers/vendors.py` | Already had full CRUD |
| `app/routers/auth.py` | Login, register, me endpoints |
| `app/seed.py` | Database seeding script |

### Frontend Files Modified/Created

| File | Changes |
|------|---------|
| `src/lib/api.ts` | Centralized API client with auth |
| `src/lib/apiUtils.ts` | withFallback, toCamelCase, toSnakeCase |
| `src/stores/authStore.ts` | Added _hasHydrated for hydration tracking |
| `src/features/agents/services/agents.data.ts` | Added createAgent, updateAgent, deleteAgent |
| `src/features/agents/pages/AgentsPage.tsx` | Updated to call APIs for CRUD |
| `src/features/controls/pages/ControlsPage.tsx` | Added delete functionality |
| `src/features/auth/pages/LoginPage.tsx` | Fixed token passing to me() |
| `src/components/common/ProtectedRoute.tsx` | Added hydration check |

---

## Environment Setup

### Required Environment Variables

**Frontend (`.env` or `.env.local`):**
```bash
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=false
```

**Backend (`.env`):**
```bash
DATABASE_URL=sqlite:///./tprm.db
SECRET_KEY=your-secret-key-here
```

### Running the Application

```bash
# Terminal 1 - Backend
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd Frontend
npm install
npm run dev
```

---

## Conclusion

The integration follows these key principles:

1. **Centralized API client** - All HTTP requests go through `api.ts`
2. **Consistent data transformation** - snake_case ↔ camelCase conversion
3. **Optimistic updates** - UI updates immediately, then syncs with backend
4. **Proper error handling** - Errors propagate to UI for user feedback
5. **Type safety** - TypeScript interfaces match backend schemas

The app now properly persists all data to the PostgreSQL database through the FastAPI backend, with JWT authentication securing all endpoints.
