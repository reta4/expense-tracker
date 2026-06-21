# Expense Tracker Backend

## What this backend does
This backend acts as a secure bridge between the frontend and Salesforce. It authenticates users, exposes a small API for expenses and categories, and keeps the Salesforce integration logic in one place.

## Main purpose
The backend is designed to make the frontend simple. Instead of calling Salesforce directly from the client, the frontend talks to this backend, which handles authentication, request validation, and Salesforce communication.

## Main features
- Firebase token validation
- Expense CRUD endpoints
- Category lookup endpoint
- Salesforce OAuth and API integration
- Safe payload handling for Salesforce picklist fields

## Main folders
- config/: environment variables and configuration
- middleware/: authentication and error handling
- routes/: API endpoints for auth and expenses
- services/: Salesforce integration logic
- tests/: smoke tests for the service layer

## Main endpoints
- POST /api/create-contact
- POST /api/register
- POST /api/login
- GET /api/expenses
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id
- GET /api/categories

## How it works
1. The frontend sends a request to the backend.
2. The backend validates the Firebase token.
3. The backend calls Salesforce using OAuth credentials.
4. Salesforce returns the requested data.
5. The backend returns a clean response to the frontend.

## Salesforce integration focus
This project uses Salesforce as the main data source for expense records and category picklists. The backend is the layer that connects the app to Salesforce in a controlled and maintainable way.

## Local run
```bash
cd backend
cp .env.example .env   # then fill in your values
# Place serviceAccountKey.json here OR set FIREBASE_SERVICE_ACCOUNT_JSON
npm install
npm run dev
```

## Test
```bash
node tests/salesforceService.test.js
```

## Deployment note
The backend is intended to be deployed to a hosting platform that supports Node.js, such as Render or Railway.
