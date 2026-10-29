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
JWT_SECRET=super_secret_jwt_polling_key_2025
```

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
2. Set `MONGO_URI` to the MongoDB Atlas connection string and `AI_API_KEY` to
   your AI provider key in Render's private environment settings. Do not commit
   these values or put the AI key in a `VITE_` variable.
   The Render Blueprint is configured for Google's OpenAI-compatible Gemini
   endpoint and `gemini-3.8-flash`.
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

### AI Poll Copilot:
Set `AI_API_KEY` in the backend environment to enable AI-generated poll
suggestions. The default endpoint and model use the OpenAI-compatible Chat
Completions API; set `AI_API_URL` and `AI_MODEL` for a compatible provider.
The key stays on the server and is never exposed to the frontend. The feature
requires a logged-in user and shows a configuration message until a key is set.
For Render, add these values under the backend service's Environment settings.
