import Poll from "../models/Poll.js";
import User from "../models/User.js";

export const adminDashboard = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.status(200).json({ users, polls });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate("createdBy", "name email role");
    res.status(200).json(polls);
  } catch (error) {
    console.error("Admin Get Polls Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// admin poll ko block aur unblock kare sakta hai
export const togglePollStatus = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    poll.isActive = !poll.isActive;
    await poll.save();

    res.status(200).json({
      message: poll.isActive ? "Poll unblocked" : "Poll blocked",
      poll,
    });
  } catch (error) {
    console.error("Admin Toggle Poll Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// admin poll ko delete kar sakta hai
export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByIdAndDelete(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Delete Poll Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// users pe admin ka control
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// admin user ko block aur unblock kar sakta hai
export const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
      user,
    });
  } catch (error) {
    console.error("Block User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
