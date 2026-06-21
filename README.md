# Expense Tracker

Web app for personal expense tracking. Users sign in with **Firebase**; expenses are stored in **Salesforce** on the `Expense__c` object, linked to a **Contact** record.

```
React (Vite)  →  Express API  →  Salesforce REST API
     ↓
Firebase Auth     Firestore (user ↔ Contact mapping)
```

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite — port 5173 |
| Backend | Node.js, Express — port 3001 |
| Auth | Firebase Authentication |
| CRM data | Salesforce `Expense__c` + Contact |

## Quick start (developers)

**Backend**

```bash
cd backend
cp .env.example .env   # fill Salesforce + Firebase credentials
npm install
npm run dev
```

**Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Documentation

| Audience | Start here |
|----------|------------|
| **Salesforce Admin** | [docs/SALESFORCE_ADMIN.md](docs/SALESFORCE_ADMIN.md) — org setup, objects, flows, reports |
| **UI walkthrough** | [docs/react-screenshots/README.md](docs/react-screenshots/README.md) — app screens |
| **Salesforce config** | [docs/salesforce-screenshots/README.md](docs/salesforce-screenshots/README.md) — org screenshots |
| **All docs** | [docs/README.md](docs/README.md) — full index |

## Security (summary)

- The API resolves each user's Salesforce Contact **on the server** (Firestore profile or email lookup).
- Clients cannot pass another user's `contactId`.
- Create / update / delete verify record ownership before writing to Salesforce.

## Firestore (backend)

Deploy rules: `firebase deploy --only firestore:rules`

If the backend logs `Firestore Admin unavailable`, grant the service account **Cloud Datastore User** in Google Cloud IAM — see [docs/README.md](docs/README.md#firestore-backend).
