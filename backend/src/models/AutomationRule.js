import mongoose from "mongoose";

const automationRuleSchema = new mongoose.Schema(
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
    merchantContains: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    appliesToType: {
      type: String,
      enum: ["all", "expense", "income"],
      default: "expense"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

automationRuleSchema.index({ createdBy: 1, merchantContains: 1, category: 1 }, { unique: true });

export const AutomationRule = mongoose.model("AutomationRule", automationRuleSchema);
