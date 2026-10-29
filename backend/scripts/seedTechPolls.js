import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Poll from "../models/Poll.js";
import User from "../models/User.js";
import { techPolls } from "../data/techPolls.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

try {
  if (techPolls.length !== 100) {
    throw new Error(`Expected exactly 100 tech polls, received ${techPolls.length}.`);
  }

  await connectDB();

  const ownerEmail = process.env.TECH_POLLS_OWNER_EMAIL?.trim().toLowerCase();
  const owner = ownerEmail
    ? await User.findOne({ email: ownerEmail, isBlocked: false })
    : (await User.findOne({ role: "admin", isBlocked: false }).sort({ createdAt: 1 })) ||
      (await User.findOne({ isBlocked: false }).sort({ createdAt: 1 }));

  if (!owner) {
    throw new Error(
      ownerEmail
        ? "No active account found for TECH_POLLS_OWNER_EMAIL."
        : "No active user account found. Register an account before seeding polls.",
    );
  }

  const operations = techPolls.map((poll, index) => {
    const slug = `tech-${String(index + 1).padStart(3, "0")}-${slugify(poll.question)}`;

    return {
      updateOne: {
        filter: { slug },
        update: {
          $setOnInsert: {
            ...poll,
            options: poll.options.map((text) => ({ text, voteCount: 0 })),
            createdBy: owner._id,
            slug,
            settings: {
              allowAnonymous: true,
              maxVotesPerUser: 1,
              showResultsMode: "always",
              expiresAt: null,
            },
            totalVotes: 0,
            isActive: true,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Poll.bulkWrite(operations, { ordered: true });
  console.log(
    `Tech polls ready: ${result.upsertedCount} added, ${result.matchedCount} already existed.`,
  );
} catch (error) {
  console.error("Tech poll seeding failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
