import express from "express";
import { getPollResults } from "../controllers/resultsController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Optional auth: results view karte waqt check kar sakein agar user ne vote diya hai
router.get("/:pollId", optionalAuth, getPollResults);

export default router;
