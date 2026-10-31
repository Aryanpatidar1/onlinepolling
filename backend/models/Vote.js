import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll.options",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    anonymousId: {
      type: String,
      default: null,
    },

    voterKey: {
      type: String,
      required: false,
    },

    ipHash: {
      type: String,
      default: null,
    },

    suspicious: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

voteSchema.index(
  { pollId: 1, voterKey: 1, optionId: 1 },
  {
    unique: true,
    partialFilterExpression: { voterKey: { $type: "string" } },
    name: "unique_voter_option_per_poll",
  }
);
voteSchema.index({ pollId: 1, userId: 1 }, { name: "votes_by_poll_user" });
voteSchema.index({ pollId: 1, ipHash: 1, createdAt: -1 }, { name: "votes_by_ip_hash" });
voteSchema.index({ pollId: 1, createdAt: -1 }, { name: "votes_by_poll_date" });

export default mongoose.model("Vote", voteSchema);
