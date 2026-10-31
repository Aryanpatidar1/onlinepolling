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
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler } from './middleware/errorHandler.js';
import Poll from "./models/Poll.js";
import Vote from "./models/Vote.js";
import Voter from "./models/Voter.js";
import User from "./models/User.js";
import { setIO } from "./utils/socket.js";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// .env file load karna
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before starting the server");
}

const app = express();

// middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "32kb" }));

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Try again later." },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." },
});
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many voting requests. Try again later." },
});
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "AI request limit reached. Try again later." },
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/votes', voteLimiter, voteRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running smoothly" });
});

// Root welcome route
app.get("/", (_req, res) => {
  res.send("Backend makkhan chal rha hai 👍👍👍");
});

app.use(errorHandler);

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
setIO(ioInstance);

// Socket events
ioInstance.on("connection", (socket) => {
  socket.data.pollRooms = new Set();

  socket.on("joinPoll", async (pollId, acknowledge) => {
    const respond = typeof acknowledge === "function" ? acknowledge : () => {};
    if (typeof pollId !== "string" || !/^[a-f\d]{24}$/i.test(pollId)) {
      respond({ ok: false, message: "Invalid poll ID" });
      return;
    }

    try {
      const exists = await Poll.exists({ _id: pollId });
      if (!exists) {
        respond({ ok: false, message: "Poll not found" });
        return;
      }

      for (const previousRoom of socket.data.pollRooms) {
        socket.leave(previousRoom);
        ioInstance.to(previousRoom).emit("pollPresence", {
          pollId: previousRoom,
          participants: ioInstance.sockets.adapter.rooms.get(previousRoom)?.size || 0,
        });
      }

      await socket.join(pollId);
      socket.data.pollRooms = new Set([pollId]);
      const participants = ioInstance.sockets.adapter.rooms.get(pollId)?.size || 0;
      ioInstance.to(pollId).emit("pollPresence", { pollId, participants });
      respond({ ok: true, participants });
    } catch (error) {
      console.error("Socket poll join failed", error.message);
      respond({ ok: false, message: "Unable to join poll updates" });
    }
  });

  socket.on("disconnect", () => {
    for (const pollId of socket.data.pollRooms || []) {
      ioInstance.to(pollId).emit("pollPresence", {
        pollId,
        participants: ioInstance.sockets.adapter.rooms.get(pollId)?.size || 0,
      });
    }
  });
});

export const io = ioInstance;

const PORT = process.env.PORT || 3001;

await connectDB();
await Promise.all([User.init(), Poll.init(), Vote.init(), Voter.init()]);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
