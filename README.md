# AI Powered Expense Tracker

AI Powered Expense Tracker is a full-stack personal finance project with:

- `frontend/`: Vite + React + Tailwind CSS
- `backend/`: Node.js + Express + MongoDB Atlas via Mongoose
- premium dark finance UI theme
- user-scoped wallets, categories, budgets, goals, and transactions
- OCR parsing, SMS parsing, and AI insight endpoints

## Quick overview

This app is designed to help users manage daily expenses, plan budgets, and review financial health from a single dashboard. The frontend focuses on a polished experience for tracking transactions and insights, while the backend provides the data model, API routes, and automation features that power the experience.

## Backend stack

The Node backend now lives in `backend/src` and includes:

- Express API with modular routes/controllers
- MongoDB Atlas connection via `MONGODB_URI`
- Mongoose models for `User`, `Wallet`, `Category`, `Transaction`, `Budget`, and `Goal`
- local auth fallback using `x-clerk-user-id` or env defaults
- dashboard summary aggregation
- OCR review endpoint
- SMS parser endpoint for common banking/UPI text
- AI insights endpoint for recurring-spend and category-spend warnings

## API routes

Base URL: `http://localhost:4000/api`

- `GET /health`
- `GET /dashboard`
- `GET|POST /transactions`
- `PATCH|DELETE /transactions/:id`
- `GET|POST /wallets`
- `GET|POST /categories`
- `GET|POST /budgets`
- `GET|POST /goals`
- `POST /ocr/parse`
- `POST /sms/parse`
- `GET /ai/insights`

## Environment setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority&appName=ai-powered-expense-tracker
MONGODB_DB_NAME=ai_powered_expense_tracker
```

3. Optional local auth defaults:

```env
DEV_CLERK_USER_ID=dev-user-001
DEV_USER_EMAIL=demo@expense-tracker.local
DEV_USER_NAME=Demo User
```

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Set:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Atlas notes

- In MongoDB Atlas, allow your current IP in Network Access.
- Create a database user with read/write access.
- Paste the generated connection string into `backend/.env`.
- The backend will create collections automatically through Mongoose once requests start hitting the API.

## Auth note

The backend is ready for user ownership rules now. For local development it uses:

- `x-clerk-user-id`
- `x-user-email`
- `x-user-name`

If these headers are absent, it falls back to the dev values in `.env`. This keeps the API usable while the Clerk frontend integration is still being wired through end to end.



<!-- core product features  -->
Recurring expense tracking for subscriptions, EMIs, rent, and bills.
Smart category auto-tagging like food, travel, shopping, utilities.
Monthly budget planner with category-wise limits.
Cash flow dashboard showing income vs expenses vs savings.  -- overview dashboard
Multi-account support for bank, wallet, UPI, cash, and credit card.
Advanced filters and search by merchant, amount, category, and date.
Export reports to PDF or CSV.


<!-- automation features -->
SMS auto-expense extraction from bank and UPI alerts.
overspending over budget -- alert
Screenshot/receipt upload with OCR-based parsing.
Email invoice parsing for bills and subscriptions.  or sms 
Auto recurring reminders for due payments.
Rule-based automation like “If merchant contains Uber, set category Travel.”