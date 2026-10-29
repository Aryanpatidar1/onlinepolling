import mongoose, { mongo } from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (v) {
          return v.length >= 2;
        },
        message: "Poll must have at least 2 options",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    settings: {
      allowAnonymous: { type: Boolean, default: true },
      maxVotesPerUser: { type: Number, default: 1 },
      showResultsMode: {
        type: String,
        enum: ["always", "afterVote", "never"],
        default: "always",
      },
      expiresAt: { type: Date, default: null },
    },
    totalVotes: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);
