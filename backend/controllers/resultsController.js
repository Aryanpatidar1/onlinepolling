import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";

export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const user = req.user || null;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });


    // Show results setting check

    if (poll.settings.showResultsMode === "never") {
      return res.status(403).json({ message: "Results are hidden for this poll" });
    }

    if (poll.settings.showResultsMode === "afterVote") {
      let userHasVoted = false;

      if (user) {
        userHasVoted = await Vote.exists({ pollId, userId: user.id });
      } else {
        const anonymousId = req.headers["x-anonymous-id"];
        const ip = req.ip;
        userHasVoted = await Vote.exists({
          pollId,
          $or: [{ anonymousId }, { ip }],
        });
      }

      if (!userHasVoted) {
        return res.status(403).json({
          message: "You must vote before viewing results",
        });
      }
    }


    //  results calculate karenge

    const results = poll.options.map((opt) => ({
      id: opt._id,
      text: opt.text,
      voteCount: opt.voteCount,
      percentage: poll.totalVotes ? ((opt.voteCount / poll.totalVotes) * 100).toFixed(2) : 0,
    }));

    res.status(200).json({
      pollId,
      question: poll.question,
      totalVotes: poll.totalVotes,
      results,
    });
  } catch (error) {
    console.error("Results Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
