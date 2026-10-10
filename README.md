# Credit Ledger App

A full-stack MERN application that helps small shopkeepers and local businesses
manage customer credit (udhar) digitally, replacing the traditional paper ledger.
Every shopkeeper signs up with their own account and sees only their own data.

## Features
- Secure sign up / login (JWT authentication, bcrypt-hashed passwords)
- Each user's customers and entries are private to their account
- Add, edit, delete and search customers
- Record credit given and payments received, with date and note
- Automatic per-customer balance (credit given minus payments received)
- Dashboard with total credit given, total received and total pending
- One-click WhatsApp payment reminders
- Responsive design that works on mobile and desktop

## Tech Stack
- **Frontend:** React, Vite
- **Backend:** Node.js, Express, JWT, bcryptjs
- **Database:** MongoDB with Mongoose
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Project Structure
```
credit-ledger-app/
├── client/            React + Vite frontend
│   └── src/           App.jsx, api.js, components/
├── server/            Express backend
│   ├── app.js         Express app (routes, CORS, rate limit)
│   ├── server.js      Connects to MongoDB and starts the server
│   ├── models/        User, Customer, Transaction
│   ├── routes/        auth.js (login/register), api.js (ledger)
│   └── middleware/    auth.js (JWT check)
├── render.yaml        Render deployment blueprint
└── package.json       One-command scripts for development
```

## Run Locally (VS Code)

**Requirements:** Node.js 18+ and a MongoDB database. Easiest option is a free
MongoDB Atlas cluster (see Deployment, step 1). Alternatively run MongoDB locally
with Docker: `docker compose up -d`.

1. Open the project folder in VS Code and open the terminal (`Ctrl + ~`).
2. Install everything:
   ```bash
   npm install
   npm run setup
   ```
3. Create the server settings file:
   ```bash
   cp server/.env.example server/.env
   ```
   Open `server/.env` and set:
   - `MONGO_URI` = your MongoDB connection string (Atlas, or the local default)
   - `JWT_SECRET` = a long random string. Generate one with:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Start frontend and backend together:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173, click **Account banayein** (create account), then log in.

## API
Public routes:

| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register | `{name, email, password}` returns `{token, user}` |
| POST | /api/auth/login | `{email, password}` returns `{token, user}` |

Protected routes (send header `Authorization: Bearer <token>`):

| Method | Route | Purpose |
|---|---|---|
| GET | /api/auth/me | Current user |
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
1. Create a free M0 cluster at mongodb.com/atlas.
2. Create a database user (letters and numbers only in the password) and allow `0.0.0.0/0` under Network Access.
3. Copy the connection string (`mongodb+srv://...`), replace `<password>` with your password and add `/credit-ledger` after `mongodb.net`.

### 2. Backend: Render
1. On render.com choose **New > Web Service** and select this repo.
2. Settings: Root Directory `server`, Build Command `npm install`, Start Command `npm start`, Instance Type Free.
3. Environment variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = Atlas connection string
   - `JWT_SECRET` = a long random string (see command above)
   - `CORS_ORIGIN` = your Vercel URL (add after step 3)
4. Open `/health` on the Render URL to confirm it is running.

(`render.yaml` is also included if you prefer **New > Blueprint**; it generates `JWT_SECRET` automatically.)

### 3. Frontend: Vercel
1. On vercel.com choose **Add New > Project** and import this repo.
2. Set **Root Directory** to `client` (Framework: Vite).
3. Add environment variable `VITE_API_URL` = your Render backend URL (no trailing slash).
4. Deploy, then put the Vercel URL into Render's `CORS_ORIGIN` and let it redeploy.

Note: on Render's free plan the server sleeps after 15 minutes of inactivity, so the first request may take up to a minute.

## Security Notes
- Passwords are stored only as bcrypt hashes.
- Login and register are rate limited (20 attempts per 15 minutes per IP).
- Every database query is filtered by the logged-in user, so users cannot see each other's data.
- Never commit `server/.env`; it is already in `.gitignore`.
