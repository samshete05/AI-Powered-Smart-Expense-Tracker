import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    icon: {
      type: String,
      default: "wallet"
    },
    color: {
      type: String,
      default: "#818cf8"
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ createdBy: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);
