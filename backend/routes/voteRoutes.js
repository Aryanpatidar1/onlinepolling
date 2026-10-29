import express from "express";
import { castVote } from "../controllers/voteController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Optional auth: agar voter logged in hai toh voterId save hogi, warna anonymous ya IP se record hoga
router.post("/:pollId", optionalAuth, castVote);

export default router;
