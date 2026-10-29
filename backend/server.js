import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import resultsRoutes from './routes/resultsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// .env file load karna
dotenv.config();

const app = express();

// middleware
app.use(express.json());

// CORS origin checker function
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Postman, server-to-server, mobile app
  if (process.env.CLIENT_ORIGIN && origin.replace(/\/$/, "") === process.env.CLIENT_ORIGIN.replace(/\/$/, "")) {
    return true;
  }
  // Localhost on any port (5173, 5174, 3000, 5175, etc.)
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  // Vercel deployment preview & production domains
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));

app.use(helmet());

// Rate limiter - protects server without blocking active users
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000,
  message: { message: "Too many requests. Try again later." },
});
app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running smoothly" });
});

// Root welcome route
app.get("/", (_req, res) => {
  res.send("Backend makkhan chal rha hai 👍👍👍");
});

app.use(errorHandler);

// Database connection
connectDB();

// HTTP server for socket.io
const server = http.createServer(app);

const ioInstance = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket events
ioInstance.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("joinTest", (data) => {
    console.log("joinTest event data: ", data);
    socket.emit("Server Message", "Hello bro, this message is from server via socket❤️❤️");
  });

  socket.on("joinPoll", (pollId) => {
    socket.join(pollId);
    console.log(`User joined poll room: ${pollId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

export const io = ioInstance;

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🏃‍♂️🏃‍♂️🏃‍♂️`);
});
