import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 0
    },
    alertThreshold: {
      type: Number,
      default: 80
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index({ createdBy: 1, category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);
