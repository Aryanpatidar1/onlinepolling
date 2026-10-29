import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {getAllPolls, togglePollStatus, deletePoll, getAllUsers, toggleUserBlock, adminDashboard} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, adminDashboard);
router.get("/polls", protect, adminOnly, getAllPolls);
router.patch("/polls/:pollId/toggle", protect, adminOnly, togglePollStatus);
router.delete("/polls/:pollId", protect, adminOnly, deletePoll);

router.get("/users", protect, adminOnly, getAllUsers);
router.put("/user/:userId", protect, adminOnly, toggleUserBlock);

export default router;
