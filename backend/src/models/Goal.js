import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

export const Goal = mongoose.model("Goal", goalSchema);
