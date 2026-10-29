import Poll from '../models/Poll.js'
import Vote from '../models/Vote.js';
import vote from '../models/Vote.js'
import {io} from '../server.js'

export const castVote = async(req ,res) => {
    try {
        const {pollId} = req.params;
        const {optionId} = req.body;
        const user = req.user || null;

        const poll = await Poll.findById(pollId);

        if(!poll){
            return res.status(404).json({ message: "Poll not found" });
        }

        if(!poll.isActive){
            return res.status(400).json({ message: "Poll is inactive" });
        }


        // expiration check karenge
        if (poll.settings.expiresAt && new Date() > poll.settings.expiresAt) {
            poll.isActive = false;
            await poll.save();
            return res.status(400).json({ message: "Poll expired" });
        }


        // anonymous voting ka validation karenge
        if (!poll.settings.allowAnonymous && !user) {
            return res.status(403).json(
                { message: "Login required to vote on this poll" }
            );
        }


        // Identify voter : logged-in or anonymous
        const voterId = user ? user.id : null;
        const anonymousId = !user ? req.headers["x-anonymous-id"] : null;
        const ip = req.ip;


        // multiple votes ko prevent karenge
        let voterQuery;
        if (user) {
            voterQuery = { userId: voterId };
        } else if (anonymousId) {
            voterQuery = { $or: [{ anonymousId }, { ip }] };
        } else {
            voterQuery = { ip };
        }

        const voteCount = await Vote.countDocuments({
            pollId,
            ...voterQuery,
        });

        if(voteCount >= poll.settings.maxVotesPerUser){
            return res.status(400).json({ message: "Vote limit reached" });
        }


        // register vote
        await Vote.create({
            pollId,
            userId: voterId,
            anonymousId,
            ip,
            optionId,
        });



        // poll vote count ko update karenge
        const option = poll.options.id(optionId);
        if(!option){
            return res.status(400).json({ message: "Invalid option" });
        }

        option.voteCount += 1;
        poll.totalVotes += 1;
        await poll.save();


        // calculate update result

        const results = poll.options.map((opt) => ({
            id: opt._id,
            text: opt.text,
            voteCount: opt.voteCount,
            percentage: poll.totalVotes ? ((opt.voteCount / poll.totalVotes) * 100).toFixed(2) : 0,
        }))


        // live update send karenge via socket 
        io.to(pollId).emit("pollUpdated", {
            pollId,
            totalVotes: poll.totalVotes,
            results,
        });

        return res.status(200).json({
            message: "Vote cast successfully",
            pollId,
            totalVotes: poll.totalVotes,
            results,
        });

    } catch (error) {
        console.error("Vote Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}