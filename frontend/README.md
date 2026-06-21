# Expense Tracker Frontend

## What this app does
This frontend is the user interface for an expense management app powered by Salesforce data. It lets users sign in, view expenses, add new transactions, edit existing ones, delete records, and review spending trends.

## Main purpose
The app is designed to give users a simple and polished experience for tracking personal or business expenses while relying on Salesforce as the system of record.

## Main features
- User authentication with Firebase
- Expense listing and filtering
- Expense creation and editing
- Expense deletion
- Category-based summaries
- Analytics dashboard views

## Main folders
- src/pages: route-level pages such as Login, Register, Home, and AnalysisView
- src/components: reusable UI blocks like forms, lists, summary cards, and analytics widgets
- src/services: API and Firebase integration
- src/hooks: shared loading logic for expenses and categories
- src/assets: category metadata and colors

## How it works
1. The user signs in through Firebase.
2. The app loads the user’s Salesforce contact ID from the user profile.
3. The frontend requests expense data from the backend.
4. The backend communicates with Salesforce and returns the records.
5. The UI renders the expenses, summaries, and analytics.

## Tech stack
- React
- Vite
- React Router
- Firebase Authentication
- Axios
- CSS

## Deployment note
The frontend is ready to be deployed to Netlify or Vercel. It expects a backend API base URL from the `VITE_API_URL` environment variable.

## Local run
```bash
cd frontend
cp .env.example .env   # then fill in your Firebase values
npm install
npm run dev
```
