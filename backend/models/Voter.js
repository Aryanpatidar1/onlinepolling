import mongoose from "mongoose";

const voterSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    voterKey: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

voterSchema.index(
  { pollId: 1, voterKey: 1 },
  { unique: true, name: "unique_voter_quota_per_poll" }
);

export default mongoose.model("Voter", voterSchema);
