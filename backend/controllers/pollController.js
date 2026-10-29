import Poll from '../models/Poll.js';
import { generateSlug } from '../utils/generateSlug.js'

export const createPoll = async (req ,res) => {
    try {
        const {question, options, settings, category} = req.body;

        // validation
        if(!question || !options || question.length<2){
            return res.status(400).json({
                message: "Question and at least 2 options are required",
            });
        }


        // createing slug
        const slug = generateSlug(question);


        // option formate
        const formattedOptions = options.map((opt) => ({
            text: opt,
            voteCount: 0,
        }));

        // poll create karenge
        const poll = await Poll.create({
            question,
            options: formattedOptions,
            createdBy: req.user.id,
            slug,
            category: category || "General",
            settings: {
                allowAnonymous: settings?.allowAnonymous ?? true,
                maxVotesPerUser: settings?.maxVotesPerUser ?? 1,
                showResultsMode: settings?.showResultsMode ?? "always",
                expiresAt: settings?.expiresAt ?? null,
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
        if(poll.settings.expiresAt && new Date() > poll.settings.expiresAt){
            poll.isActive = false;
            await poll.save();
        }

        return res.status(200).json({ poll });

    } catch (error) {
        console.error("Get Poll Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getAllPolls = async (_req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        return res.status(200).json({ polls });
    } catch (error) {
        console.error("Get All Polls Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getFeaturedPolls = async (_req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 }).limit(8);
        return res.status(200).json({ polls });
    } catch (error) {
        console.error("Get Featured Polls Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMyPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ polls });
    } catch (error) {
        console.error("Get My Polls Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePoll = async (req, res) => {
    try {
        const { id } = req.params;
        const poll = await Poll.findById(id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // only creator or admin can delete
        if (poll.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed to delete this poll" });
        }

        await poll.deleteOne();
        return res.status(200).json({ message: "Poll deleted successfully" });
    } catch (error) {
        console.error("Delete Poll Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};