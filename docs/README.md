# Documentation index

## Who should read what?

| Role | Document | Purpose |
|------|----------|---------|
| Salesforce Admin | [SALESFORCE_ADMIN.md](SALESFORCE_ADMIN.md) | How the org connects to the app, objects, flows, reports |
| Product / UX reviewer | [react-screenshots/README.md](react-screenshots/README.md) | React UI screens with captions |
| Salesforce config review | [salesforce-screenshots/README.md](salesforce-screenshots/README.md) | Flows, validation, reports, dashboard |
| Developer | [../README.md](../README.md) | Setup, stack, security summary |

## Folder structure

```
docs/
├── README.md                 ← this file
├── SALESFORCE_ADMIN.md       ← main guide for Salesforce admins
├── react-screenshots/        ← UI PNGs + README
├── salesforce-screenshots/   ← org PNGs + README
└── scripts/                  ← screenshot capture scripts (dev only)
```

## Regenerating UI screenshots

Requires frontend dev server on port 5173.

```bash
# Public pages (login, register, forgot password)
node docs/scripts/capture-react-screenshots.mjs

# Home + Analysis with real account data (log in once in the Playwright profile)
node docs/scripts/capture-authenticated-screenshots.mjs
```

## Firestore (backend)

If startup shows `Firestore Admin unavailable`:

1. Open [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam)
2. Find the Firebase service account from `backend/serviceAccountKey.json`
3. Add role **Cloud Datastore User** (`roles/datastore.user`)
4. Restart backend — expect `Firestore Admin access OK`

Until then, the app uses **Salesforce email lookup** as fallback (works, but slower).
