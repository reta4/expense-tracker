# Expense Tracker — Final Pre-Deployment Audit

Personal expense management app: **React 19 + Vite** frontend, **Node.js/Express** API proxy, **Firebase Auth + Firestore** for identity, **Salesforce** (`Contact` + `Expense__c`) as the data store.

Related documentation:

| Document | Description |
|----------|-------------|
| [README_REACT.md](./README_REACT.md) | Frontend architecture, features, auth flow, setup |
| [README_SALESFORCE.md](./README_SALESFORCE.md) | Org model, fields, validation rules, flows, reports |
| [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) | Deep code-level analysis of the full stack |

---

## Verdict: Conditional GO

| Target | Status |
|--------|--------|
| **GitHub push** | **GO** — after one clean commit that includes all pending fixes |
| **Netlify + Render live deploy** | **GO** — after platform env vars and Firebase domains are configured |

Code blockers from the audit are resolved. What remains is commit hygiene and deploy configuration on Netlify, Render, and Firebase Console.

---

## Audit Checklist

### 1. ForgotPassword case sensitivity — PASS

| Check | Status |
|-------|--------|
| Folder on disk | `frontend/src/pages/ForgotPassword/ForgotPassword.jsx` |
| Import in `App.jsx` | `./pages/ForgotPassword/ForgotPassword.jsx` |
| No leftover `forgotPassword` references | Confirmed |

The folder rename is staged in git (`forgotPassword/` → `ForgotPassword/`). Import and filesystem are aligned for Linux/Netlify builds.

---

### 2. `netlify.toml` — PASS (must be committed)

**Location:** `frontend/netlify.toml`  
**Status:** Present and correct, but was **untracked** at audit time — must be included in the commit before push.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Netlify dashboard:** set **Base directory** to `frontend` so Netlify picks up this file.

SPA routing for `/dashboard`, `/login`, and other client routes is configured correctly.

---

### 3. Firebase Admin on Render — PASS

`backend/config/firebaseAdmin.js`:

1. Reads `FIREBASE_SERVICE_ACCOUNT_JSON` (trimmed, `JSON.parse`)
2. Validates required fields: `project_id`, `private_key`, `client_email`
3. Falls back to `serviceAccountKey.json` for local development
4. Logs clear errors on invalid JSON or missing configuration
5. `server.js` exits with code `1` if Firebase init fails at startup

**Render tip:** paste the full service account JSON as a **single line**. Keep `\n` inside `private_key` as literal `\n` characters inside the JSON string.

---

### 4. Console logs, secrets, broken references — Mostly PASS

#### Console logs

| Area | Finding |
|------|---------|
| **Frontend `src/`** | No `console.log` / `console.error` — clean for production |
| **Backend** | Startup and diagnostic logs only (`server.js`, `firebaseAdmin.js`, route error handlers) — acceptable for Render logs |

#### Secrets and `.gitignore`

| File | Ignored? |
|------|----------|
| `backend/.env` | Yes |
| `frontend/.env` | Yes |
| `backend/serviceAccountKey.json` | Yes |

**Git HEAD:** no `.env` or `serviceAccountKey.json` tracked (verified by filename scan).

Verify locally:

```powershell
git check-ignore -v backend/.env frontend/.env backend/serviceAccountKey.json
```

Each file should show a matching `.gitignore` rule.

#### Production build

```bash
cd frontend
npm run build
```

Result at audit time: **success** (135 modules, no errors).

#### Broken references to fix before push

| Issue | Risk |
|-------|------|
| `frontend/netlify.toml` untracked | Netlify won't get SPA config if not committed |
| `frontend/src/utils/userProfile.js` untracked | Auth unification missing from repo |
| Salesforce screenshots — old PNGs deleted, new PNGs untracked | `README_SALESFORCE.md` links to new filenames — images break on GitHub if not committed |
| React screenshots | Still in git — OK |
| `VITE_API_URL` default | Falls back to `localhost:3001` — must set on Netlify build env |

---

## What Is Ready

- ForgotPassword casing fixed
- SPA routing config written (`frontend/netlify.toml`)
- Firebase env JSON + local file fallback
- Auth unified (`Login.jsx` + `useAuthUser.js` via `userProfile.js`)
- `formatMoney` preserves cents (no rounding to whole dollars)
- Frontend production build passes
- Secrets gitignored and not in initial commit
- Split documentation: `README_REACT.md`, `README_SALESFORCE.md`, `PROJECT_ANALYSIS.md`

---

## Final Adjustments Before Push

1. **Stage and commit everything** — especially `frontend/netlify.toml`, `userProfile.js`, new Salesforce screenshots, and removal of old ones
2. **Add LICENSE** (e.g. MIT) — optional but recommended for portfolio repos
3. **On Render:** set `FRONTEND_URL=https://your-site.netlify.app` (exact URL, no trailing slash mismatch)
4. **On Netlify:** set all `VITE_FIREBASE_*` + `VITE_API_URL=https://your-api.onrender.com/api`
5. **Firebase Console:** add Netlify domain to Authorized domains
6. **Optional hardening:** `app.listen(port, '0.0.0.0')` on Render; `app.set('trust proxy', 1)` behind reverse proxy

---

## Quick Start (Local)

### Backend

```bash
cd backend
cp .env.example .env   # fill SF_* and Firebase Admin credentials
npm install
npm run dev            # nodemon — NOT "npm start nodemon"
```

Runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
cp .env.example .env   # fill VITE_FIREBASE_* and optionally VITE_API_URL
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## Git: Step-by-Step Commands

The repo is initialized on branch `main` with one initial commit. No remote was configured at audit time.

### Step 1 — Verify secrets are ignored

```powershell
cd C:\Users\fenti\OneDrive\Desktop\expense

git check-ignore -v backend/.env frontend/.env backend/serviceAccountKey.json
```

Expected: each file listed with a matching `.gitignore` rule.

### Step 2 — Review what will be committed

```powershell
git status
```

Confirm `.env` and `serviceAccountKey.json` do **not** appear.

### Step 3 — Stage all project changes

```powershell
git add -A
git status
```

Re-check: no `.env` or `serviceAccountKey.json` under "Changes to be committed".

### Step 4 — Commit

```powershell
git commit -m "Prepare for production: Netlify SPA config, auth unification, Firebase env support, and deployment fixes"
```

### Step 5 — Create GitHub repo and link remote

On GitHub: **New repository** → name e.g. `expense-tracker` → do **not** initialize with README (this repo already has one).

HTTPS:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git branch -M main
git push -u origin main
```

SSH:

```powershell
git remote add origin git@github.com:YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

### Step 6 — Post-push verification on GitHub

On the repository page, search for:

- `serviceAccountKey` — should find **0** results with real keys
- `SF_CLIENT_SECRET` — should find **0** real values (only `.env.example` placeholders)
- `private_key` — should find **0** real Firebase private keys

---

## Deploy Checklist (After GitHub Push)

### Render (backend)

| Variable | Value |
|----------|-------|
| `PORT` | Auto (Render sets this) |
| `FRONTEND_URL` | `https://your-app.netlify.app` |
| `SF_CLIENT_ID` | Salesforce Connected App |
| `SF_CLIENT_SECRET` | Salesforce Connected App |
| `SF_LOGIN_URL` | OAuth token URL |
| `SF_INSTANCE_URL` | Salesforce instance URL |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service account JSON, single line |

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Start command | `npm start` |

### Netlify (frontend)

| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |

**Build environment variables:**

- All `VITE_FIREBASE_*` from `frontend/.env.example`
- `VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api`

### Firebase Console

- **Authentication → Settings → Authorized domains** → add `your-app.netlify.app`

---

## Architecture

```
React (Vite)  →  Node.js API  →  Salesforce REST API
      ↓
Firebase Auth + Firestore (user profile, Contact link)
```

The browser never talks to Salesforce directly. Each API call sends a Firebase ID token; the server resolves the user's Contact and reads/writes `Expense__c` on their behalf.

---

## Audit Summary Table

| Area | Status |
|------|--------|
| ForgotPassword casing | GO |
| netlify.toml | GO (commit first) |
| Firebase env JSON | GO |
| Auth consistency | GO |
| Money formatting | GO |
| Production build | GO |
| Secrets protection | GO |
| Git remote / full commit | Action needed |
| Platform env vars | Action needed at deploy time |

---

## Bottom Line

You are ready to push to GitHub after one complete commit that includes all pending files.

Live deploy on Netlify + Render is ready once environment variables and Firebase authorized domains are configured — not blocked by remaining code issues.

**Score at audit time:** ~85/100 for deploy readiness (code complete; deploy config and commit hygiene pending).

---

## Project Structure

```
expense/
├── frontend/          React 19 + Vite SPA (+ netlify.toml)
├── backend/           Express API proxy to Salesforce
├── docs/              Screenshots + capture scripts
├── firestore.rules    Firestore security rules
├── README.md          This file — final pre-deployment audit
├── README_REACT.md    Frontend documentation
├── README_SALESFORCE.md   Salesforce org documentation
└── PROJECT_ANALYSIS.md    Code analysis
```
