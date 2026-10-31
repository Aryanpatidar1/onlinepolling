import { randomBytes } from "crypto";
import Poll from '../models/Poll.js';
import Vote from "../models/Vote.js";
import Voter from "../models/Voter.js";
import mongoose from "mongoose";
import { getIO } from "../utils/socket.js";
import {
    ensureAnonymousVoterCookie,
    getAnonymousVoterId,
} from "../utils/anonymousVoter.js";
import { generateSlug } from '../utils/generateSlug.js'

export const createPoll = async (req ,res) => {
    try {
        const {question, description, options, settings, category} = req.body || {};
        const validSettings =
            settings === undefined ||
            settings === null ||
            (typeof settings === "object" &&
                !Array.isArray(settings) &&
                (settings.allowAnonymous === undefined ||
                    typeof settings.allowAnonymous === "boolean") &&
                (settings.maxVotesPerUser === undefined ||
                    (Number.isInteger(Number(settings.maxVotesPerUser)) &&
                        Number(settings.maxVotesPerUser) >= 1 &&
                        Number(settings.maxVotesPerUser) <= 10)) &&
                (settings.showResultsMode === undefined ||
                    ["always", "afterVote", "never"].includes(settings.showResultsMode)));
        const optionLabels = Array.isArray(options)
            ? options.map((option) => typeof option === "string" ? option.trim().toLocaleLowerCase() : "")
            : [];

        if (
            !validSettings ||
            typeof question !== "string" ||
            question.trim().length < 2 ||
            question.trim().length > 300 ||
            !Array.isArray(options) ||
            options.length < 2 ||
            options.length > 6 ||
            options.some((option) => typeof option !== "string" || !option.trim() || option.trim().length > 100) ||
            new Set(optionLabels).size !== optionLabels.length
        ) {
            return res.status(400).json({
                message: "Provide a question, 2 to 6 unique options, and valid poll settings",
            });
        }

        const expiresAt = settings?.expiresAt ? new Date(settings.expiresAt) : null;
        if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())) {
            return res.status(400).json({ message: "Expiry date must be a valid future date" });
        }

        const formattedOptions = options.map((option) => ({
            text: option.trim(),
            voteCount: 0,
        }));

        const poll = await Poll.create({
            question: question.trim(),
            description: typeof description === "string" ? description.trim().slice(0, 1000) : "",
            options: formattedOptions,
            createdBy: req.user.id,
            slug: `${generateSlug(question)}-${randomBytes(4).toString("hex")}`,
            category: typeof category === "string" ? category.trim().slice(0, 60) : "General",
            settings: {
                allowAnonymous: settings?.allowAnonymous ?? true,
                maxVotesPerUser: Math.min(10, Math.max(1, Number(settings?.maxVotesPerUser) || 1)),
                showResultsMode: settings?.showResultsMode ?? "always",
                expiresAt,
            }
        });

        return res.status(201).json({
            message: "Poll created successfully...",
            poll,
            shareUrl: `/poll/${poll.slug}`,
        });
    } catch (error) {
        console.error("Create Poll Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const getPoll = async (req, res) => {
    try {
        const {slug} = req.params;

        const poll = await Poll.findOne({slug});

        if(!poll)
        {
            return res.status(404).json({ message: "Poll not found" });
        }

        // check karenge ki poll expired hua hai ki nhi: agar poll expire ho jayega to isActive ko 'false' kar denge
        if(poll.settings.expiresAt && new Date() >= poll.settings.expiresAt && poll.isActive){
            poll.isActive = false;
            await poll.save();
            getIO()?.to(poll._id.toString()).emit("pollStatusUpdated", {
                pollId: poll._id.toString(),
                isActive: false,
                status: "expired",
            });
        }

        const anonymousId =
            !req.user && poll.settings.allowAnonymous
                ? ensureAnonymousVoterCookie(req, res)
                : getAnonymousVoterId(req);
        const voterQuery = req.user
            ? { pollId: poll._id, userId: req.user.id }
            : anonymousId
                ? { pollId: poll._id, anonymousId }
                : null;
        const previousVote = voterQuery ? await Vote.findOne(voterQuery).select("optionId") : null;
        const hasVoted = Boolean(previousVote);
        const isOwner =
            req.user &&
            (poll.createdBy.toString() === req.user.id || req.user.role === "admin");
        const canSeeResults =
            isOwner ||
            poll.settings.showResultsMode === "always" ||
            (poll.settings.showResultsMode === "afterVote" && hasVoted);

        const responsePoll = poll.toObject();
        responsePoll.hasVoted = hasVoted;
        responsePoll.votedOptionId = previousVote?.optionId || null;
        if (!canSeeResults) {
            responsePoll.totalVotes = 0;
            responsePoll.options.forEach((option) => {
                option.voteCount = 0;
            });
        }

        return res.status(200).json({ poll: responsePoll });

    } catch (error) {
        console.error("Get Poll Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getAllPolls = async (_req, res) => {
    try {
        const polls = (await Poll.find().sort({ createdAt: -1 })).map(hideRestrictedResults);
        return res.status(200).json({ polls });
    } catch (error) {
        console.error("Get All Polls Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getFeaturedPolls = async (_req, res) => {
    try {
        const polls = (await Poll.find().sort({ createdAt: -1 }).limit(8)).map(hideRestrictedResults);
        return res.status(200).json({ polls });
    } catch (error) {
        console.error("Get Featured Polls Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const hideRestrictedResults = (poll) => {
    const data = poll.toObject();
    if (data.settings.showResultsMode !== "always") {
        data.totalVotes = 0;
        data.options.forEach((option) => {
            option.voteCount = 0;
        });
    }
    return data;
};

export const getMyPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        const pollIds = polls.map((poll) => poll._id);
        const activityStart = new Date();
        activityStart.setUTCHours(0, 0, 0, 0);
        activityStart.setUTCDate(activityStart.getUTCDate() - 13);

        const [participantGroups, activityGroups] = pollIds.length
            ? await Promise.all([
                Vote.aggregate([
                    { $match: { pollId: { $in: pollIds } } },
                    {
                        $project: {
                            voter: {
                                $ifNull: [
                                    "$voterKey",
                                    {
                                        $ifNull: [
                                            { $toString: "$userId" },
                                            { $ifNull: ["$anonymousId", { $toString: "$_id" }] },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    { $group: { _id: "$voter" } },
                    { $count: "total" },
                ]),
                Vote.aggregate([
                    { $match: { pollId: { $in: pollIds }, createdAt: { $gte: activityStart } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            votes: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ]),
            ])
            : [[], []];

        const activityByDate = new Map(activityGroups.map(({ _id, votes }) => [_id, votes]));
        const activity = Array.from({ length: 14 }, (_, index) => {
            const date = new Date(activityStart);
            date.setUTCDate(date.getUTCDate() + index);
            const key = date.toISOString().slice(0, 10);
            return { date: key, votes: activityByDate.get(key) || 0 };
        });

        const activePolls = polls.filter(
            (poll) =>
                poll.isActive &&
                (!poll.settings.expiresAt || poll.settings.expiresAt > new Date())
        );
        const mostPopular = [...polls]
            .sort((left, right) => right.totalVotes - left.totalVotes)
            .slice(0, 3)
            .map((poll) => ({
                id: poll._id,
                slug: poll.slug,
                question: poll.question,
                totalVotes: poll.totalVotes,
            }));

        return res.status(200).json({
            polls,
            analytics: {
                totalPolls: polls.length,
                totalVotes: polls.reduce((total, poll) => total + poll.totalVotes, 0),
                activePolls: activePolls.length,
                completedPolls: polls.length - activePolls.length,
                totalParticipants: participantGroups[0]?.total || 0,
                mostPopular,
                activity,
            },
        });
    } catch (error) {
        console.error("Get My Polls Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePoll = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid poll ID" });
        }
        const poll = await Poll.findById(id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // only creator or admin can delete
        if (poll.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed to delete this poll" });
        }

        await poll.deleteOne();
        await Promise.all([
            Vote.deleteMany({ pollId: poll._id }),
            Voter.deleteMany({ pollId: poll._id }),
        ]);
        getIO()?.to(poll._id.toString()).emit("pollStatusUpdated", {
            pollId: poll._id.toString(),
            isActive: false,
            status: "deleted",
        });
        return res.status(200).json({ message: "Poll deleted successfully" });
    } catch (error) {
        console.error("Delete Poll Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};