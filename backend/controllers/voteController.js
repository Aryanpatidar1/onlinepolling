import mongoose from "mongoose";
import Poll from "../models/Poll.js";
import Vote from '../models/Vote.js';
import Voter from "../models/Voter.js";
import { getIO } from "../utils/socket.js";
import {
  ensureAnonymousVoterCookie,
  getAnonymousVoterId,
  getIpHash,
} from "../utils/anonymousVoter.js";

const duplicateKeyError = (error) => error?.code === 11000;

const claimVoteSlot = async (pollId, voterKey, limit) => {
  try {
    return await Voter.findOneAndUpdate(
      { pollId, voterKey, votes: { $lt: limit } },
      {
        $inc: { votes: 1 },
        $setOnInsert: { pollId, voterKey },
      },
      { new: true, upsert: true }
    );
  } catch (error) {
    if (!duplicateKeyError(error)) throw error;
    return Voter.findOneAndUpdate(
      { pollId, voterKey, votes: { $lt: limit } },
      { $inc: { votes: 1 } },
      { new: true }
    );
  }
};

const releaseVoteSlot = async (pollId, voterKey) => {
  await Voter.updateOne(
    { pollId, voterKey, votes: { $gt: 0 } },
    { $inc: { votes: -1 } }
  );
};

const calculateResults = (poll) =>
  poll.options.map((option) => ({
    id: option._id,
    text: option.text,
    voteCount: option.voteCount,
    percentage: poll.totalVotes
      ? Number(((option.voteCount / poll.totalVotes) * 100).toFixed(2))
      : 0,
  }));

export const castVote = async (req, res) => {
  let voterKey;
  let slotClaimed = false;
  let voteCreated = false;

  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const user = req.user || null;

    if (!mongoose.isValidObjectId(pollId) || !mongoose.isValidObjectId(optionId)) {
      return res.status(400).json({ message: "Invalid poll or option" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (!poll.isActive) {
      return res.status(400).json({ message: "Poll is inactive" });
    }

    const now = new Date();
    if (poll.settings.expiresAt && now >= poll.settings.expiresAt) {
      await Poll.updateOne({ _id: poll._id }, { $set: { isActive: false } });
      getIO()?.to(pollId).emit("pollStatusUpdated", {
        pollId,
        isActive: false,
        status: "expired",
      });
      return res.status(400).json({ message: "Poll expired" });
    }

    if (!poll.options.id(optionId)) {
      return res.status(400).json({ message: "Invalid option" });
    }

    if (!poll.settings.allowAnonymous && !user) {
      return res.status(403).json({ message: "Login required to vote on this poll" });
    }

    let anonymousId = null;
    if (user) {
      voterKey = `user:${user.id}`;
    } else {
      anonymousId = getAnonymousVoterId(req);
      if (!anonymousId) {
        ensureAnonymousVoterCookie(req, res);
        return res.status(428).json({
          message: "A secure voting identity was created. Please submit your vote again.",
        });
      }
      voterKey = `anonymous:${anonymousId}`;
    }

    const existingVote = await Vote.exists({
      pollId,
      $or: [
        { voterKey, optionId },
        ...(user ? [{ userId: user.id, optionId }] : []),
      ],
    });
    if (existingVote) {
      return res.status(409).json({ message: "You have already voted for this option" });
    }

    const legacyVoteCount = await Vote.countDocuments({
      pollId,
      ...(user ? { userId: user.id } : { anonymousId }),
      voterKey: { $exists: false },
    });
    try {
      await Voter.updateOne(
        { pollId, voterKey },
        { $setOnInsert: { pollId, voterKey, votes: legacyVoteCount } },
        { upsert: true }
      );
    } catch (error) {
      if (!duplicateKeyError(error)) throw error;
    }

    const voter = await claimVoteSlot(
      poll._id,
      voterKey,
      Math.max(1, poll.settings.maxVotesPerUser || 1)
    );
    if (!voter) {
      const racedDuplicate = await Vote.exists({
        pollId,
        voterKey,
        optionId,
      });
      return res.status(racedDuplicate ? 409 : 400).json({
        message: racedDuplicate
          ? "You have already voted for this option"
          : "Vote limit reached",
      });
    }
    slotClaimed = true;

    const ipHash = getIpHash(req.ip);
    const recentVotesFromIp = await Vote.countDocuments({
      pollId,
      ipHash,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    const suspicious = recentVotesFromIp >= 5;
    if (suspicious) {
      console.warn("Suspicious voting burst detected", { pollId, recentVotesFromIp });
    }

    try {
      await Vote.create({
        pollId,
        userId: user?.id || null,
        anonymousId,
        voterKey,
        ipHash,
        suspicious,
        optionId,
      });
      voteCreated = true;
    } catch (error) {
      await releaseVoteSlot(poll._id, voterKey);
      slotClaimed = false;
      if (duplicateKeyError(error)) {
        return res.status(409).json({
          message: "You have already voted for this option",
        });
      }
      throw error;
    }

    const updated = await Poll.findOneAndUpdate(
      {
        _id: poll._id,
        isActive: true,
        $or: [
          { "settings.expiresAt": null },
          { "settings.expiresAt": { $exists: false } },
          { "settings.expiresAt": { $gt: now } },
        ],
        "options._id": optionId,
      },
      {
        $inc: {
          totalVotes: 1,
          "options.$.voteCount": 1,
        },
      },
      { new: true }
    );

    if (!updated) {
      await Vote.deleteOne({ pollId, voterKey, optionId });
      voteCreated = false;
      await releaseVoteSlot(poll._id, voterKey);
      slotClaimed = false;
      return res.status(409).json({ message: "Poll is no longer accepting votes" });
    }
    slotClaimed = false;
    voteCreated = false;

    const results = calculateResults(updated);
    const canShareResults = updated.settings.showResultsMode !== "never";
    const visibleResults = canShareResults
      ? results
      : results.map((result) => ({ ...result, voteCount: 0, percentage: 0 }));
    const voteCounts = canShareResults ? results.map((result) => result.voteCount) : [];
    const winningCount = Math.max(...voteCounts);
    const winners = results.filter((result) => result.voteCount === winningCount);
    const winner = winningCount > 0 && winners.length === 1 ? winners[0] : null;
    const update = {
      pollId,
      totalVotes: canShareResults ? updated.totalVotes : 0,
      results: visibleResults,
      isActive: updated.isActive,
      winner: canShareResults ? winner : null,
    };

    const liveUpdate =
      updated.settings.showResultsMode === "always"
        ? update
        : { pollId, isActive: updated.isActive };
    getIO()?.to(pollId).emit("pollUpdated", liveUpdate);
    return res.status(200).json({
      message: "Vote cast successfully",
      ...update,
    });
  } catch (error) {
    if (voteCreated && voterKey) {
      await Vote.deleteOne({
        pollId: req.params.pollId,
        voterKey,
        optionId: req.body?.optionId,
      });
    }
    if (slotClaimed && voterKey) {
      await releaseVoteSlot(req.params.pollId, voterKey);
    }
    console.error("Vote Error:", error);
    return res.status(500).json({ message: "Unable to record vote" });
  }
};