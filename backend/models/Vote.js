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

    ip: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vote", voteSchema);
