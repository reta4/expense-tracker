# Expense Tracker — Salesforce Admin Guide

Short guide for Salesforce admins onboarding to this project. For app screens see [react-screenshots](react-screenshots/README.md); for org configuration see [salesforce-screenshots](salesforce-screenshots/README.md).

## What does the project do?

A web app for personal expense tracking. Users register and sign in with **Firebase**; data is stored in Salesforce on **`Expense__c`**, linked to the user's **Contact**.

```
User → Firebase Auth → Backend (Node) → Salesforce API → Expense__c
                              ↓
                         Firestore: users/{uid} → Contact Id
```

## Key objects and fields

### Contact

- Created on registration (`LeadSource: Web App`)
- Firebase email should match the Contact email (or mapping stored in Firestore)

### Expense__c

| Field | App usage |
|-------|-----------|
| `Name` | Expense name |
| `Amount__c` | Amount |
| `Date__c` | Date |
| `Category__c` | Category (picklist) |
| `Is_Recurring__c` | Recurring expense flag |
| `User_Contact__c` | Lookup to Contact — **required**; set by the server on create |

The app only returns records where `User_Contact__c` matches the signed-in user's Contact.

## User flow (CRM level)

1. **Register** — new Contact in Salesforce + profile in Firestore
2. **Sign in** — Firebase token; server resolves Contact
3. **Expense CRUD** — create / read / update / delete on `Expense__c` via REST API
4. **Flows / reports** — run in Salesforce (emails, totals, recurring) — see org screenshots

## API reference

| Action | Endpoint |
|--------|----------|
| List expenses | `GET /api/expenses` |
| Create | `POST /api/expenses` |
| Update | `PUT /api/expenses/:id` |
| Delete | `DELETE /api/expenses/:id` |
| Categories | `GET /api/categories` |

All requests require `Authorization: Bearer <Firebase token>`.

## Org checklist

- [ ] Validation rules on `Amount__c` (screenshot 02)
- [ ] Flows: Contact totals, delete handling, recurring, weekly/monthly emails (screenshots 03–08)
- [ ] Reports and dashboard (screenshots 09–18)
- [ ] `Category__c` picklist values align with what the app sends

## Screenshots

| Folder | Content |
|--------|---------|
| [react-screenshots/](react-screenshots/README.md) | React UI — login, home, analysis |
| [salesforce-screenshots/](salesforce-screenshots/README.md) | Salesforce setup, flows, reports |

## Local development (brief)

```bash
cd backend && npm run dev    # port 3001
cd frontend && npm run dev   # port 5173
```

Full setup: [README.md](../README.md) in the project root.
