import express from "express";
import {
  generatePollDraft,
  generatePollInsights,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate-poll", protect, generatePollDraft);
router.post("/polls/:pollId/insights", protect, generatePollInsights);

export default router;
