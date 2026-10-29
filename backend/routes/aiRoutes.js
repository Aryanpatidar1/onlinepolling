import express from "express";
import rateLimit from "express-rate-limit";
import { generatePollSuggestions } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const aiSuggestionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests. Please try again later." },
});

router.post("/poll-suggestions", protect, aiSuggestionLimiter, generatePollSuggestions);

export default router;
