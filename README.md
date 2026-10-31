# 📊 PrimePoll - Online Polling System

Full-stack Online Polling Application with real-time updates via Socket.IO, JWT authentication, and MongoDB.

---

## 📁 Project Structure

```text
online-polling/
├── backend/            # Express, Node.js, MongoDB, Socket.io
│   ├── config/         # Database connection
│   ├── controllers/    # API controllers (auth, poll, vote, admin)
│   ├── middleware/     # Auth (protect & optionalAuth), error handling
│   ├── models/         # Mongoose schemas (User, Poll, Vote)
│   ├── routes/         # Express routes
│   ├── .env            # Backend environment variables
│   └── server.js       # Main entry point
└── frontend/           # React + Vite, Socket.io-client, Axios
    ├── src/
    │   ├── api/        # Axios client with auto-logout on 401
    │   ├── components/ # Reusable UI components (Navbar, Footer, etc.)
    │   ├── pages/      # Pages (Home, Polls, CreatePoll, Dashboard, Auth, Admin)
    │   └── socket.js   # Socket.io client setup
    └── .env            # Frontend environment variables
```

---

## 🚀 How to Run Locally (Local Setup)

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

> **Backend URL:** `http://localhost:3001`

### 2. Frontend Setup

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

> **Frontend URL:** `http://localhost:5173`

---

## ⚙️ Environment Variables (.env)

### Backend (`backend/.env`):
```env
PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/online-polling?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_a_unique_random_secret_of_32_or_more_characters
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Use a unique, random `JWT_SECRET` of at least 32 characters in each environment.
The Gemini key is optional, must be configured on the backend, and must never
use a `VITE_` prefix. AI-assisted poll drafts and owner-only poll insights return
a clear configuration error until the key is set. AI requests are authenticated
and rate-limited.

## Voting integrity and live updates

Votes are rate-limited and validated on the server. MongoDB unique indexes
prevent a voter from recording the same option twice, while an atomic per-poll
voter quota enforces each poll's configured vote limit under concurrent
requests. Anonymous voters use a signed, HTTP-only cookie; vote records store
an HMAC of the client IP for short-window burst detection rather than storing
new raw IP addresses. MongoDB indexes are initialized before the API starts.
Live poll rooms validate poll IDs and broadcast vote changes, connected
participant counts, and poll status changes. Results remain hidden when the
poll's visibility setting requires it.

The dashboard includes poll/vote/participant totals, daily voting activity, and
top polls. Poll owners can request Gemini summaries, trends, caveats, and
recommendations from the poll page, and generate editable poll drafts from a
topic on the creation page.

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

## 🌐 Production Deployment Guide (Vercel + Render)

### Backend on Render.com:
1. Create a Blueprint on Render and connect this GitHub repo; Render reads
   `render.yaml` to configure the API service.
2. Set `MONGO_URI` to the MongoDB Atlas connection string in Render's private
   environment settings. Add `GEMINI_API_KEY` in Render's private environment
   settings to enable the AI features.
3. After the service is live, set these Vercel project environment variables
   and redeploy the frontend:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://<your-render-service>.onrender.com`

### Frontend on Vercel:
1. In Vercel Project Settings -> **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend.onrender.com`
2. Redeploy frontend.

### Add 100 public technology polls:
After registering an account and configuring the backend's `MONGO_URI`, run:

```bash
cd backend
npm run seed:tech-polls
```

The command is safe to rerun: it adds only missing polls. Polls are owned by the
oldest active admin account, or the oldest active account if no admin exists.
To choose a specific active account, set `TECH_POLLS_OWNER_EMAIL` before running
the command. Run this once against the production database after deploying the
backend if the polls should appear on the live site.
