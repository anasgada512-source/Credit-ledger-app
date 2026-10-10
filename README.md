# Credit Ledger App

A full-stack MERN application that helps small shopkeepers and local businesses
manage customer credit (udhar) digitally, replacing the traditional paper ledger.

## Overview
Credit Ledger App lets you keep a clear, searchable record of how much each
customer owes you. Add customers, log credit given and payments received, and
see the pending balance instantly, with no manual calculation.

## Features
- Add, edit, delete and search customers
- Record credit given and payments received, with date and note
- Automatic per-customer balance (credit given minus payments received)
- Dashboard with total credit given, total received and total pending
- One-click WhatsApp payment reminders
- Responsive design that works on mobile and desktop

## Tech Stack
- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## How It Works
Every customer has a list of transactions. A "given" transaction increases what
the customer owes, and a "received" transaction reduces it. The balance is
calculated on the server using MongoDB aggregation, so figures stay accurate.

## Local Setup
Requires Node.js 18+ and MongoDB (local or Atlas).

```bash
# Backend
cd server
cp .env.example .env      # set MONGO_URI
npm install
npm run dev               # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:5000`.

## API
| Method | Route | Purpose |
|---|---|---|
| GET | /api/summary | Total given / received / pending |
| GET | /api/customers?q= | List customers with balance |
| POST | /api/customers | Create customer |
| GET | /api/customers/:id | Customer detail + transactions |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer and transactions |
| POST | /api/customers/:id/transactions | `{type: given/received, amount, note, date}` |
| DELETE | /api/transactions/:id | Delete a transaction |

Balance = total credit given − total payments received. A positive balance means the customer owes you.

## Deployment (free tier)

### 1. Database: MongoDB Atlas
1. Create a free M0 cluster at atlas.mongodb.com.
2. Create a database user and allow `0.0.0.0/0` under Network Access.
3. Copy the connection string (`mongodb+srv://...`).

### 2. Backend: Render
1. On render.com choose **New > Blueprint** and connect this repo (`render.yaml` is picked up automatically).
2. Set environment variables:
   - `MONGO_URI` = Atlas connection string
   - `CORS_ORIGIN` = your Vercel frontend URL (add after the frontend is deployed)
3. Open `/health` on the Render URL to confirm it is running.

### 3. Frontend: Vercel
1. On vercel.com choose **Add New > Project** and import this repo.
2. Set **Root Directory** to `client` (Framework: Vite).
3. Add environment variable `VITE_API_URL` = your Render backend URL.
4. Deploy, then put the Vercel URL into Render's `CORS_ORIGIN`.

Note: on Render's free plan the server sleeps after 15 minutes of inactivity, so the first request may be slow.
