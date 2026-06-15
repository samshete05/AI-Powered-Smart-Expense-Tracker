import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
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
    normalizedName: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["cash", "bank", "card", "upi", "savings", "investment"],
      default: "bank"
    },
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: "INR"
    },
    color: {
      type: String,
      default: "#38bdf8"
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

walletSchema.pre("validate", function prepareNormalizedName(next) {
  this.normalizedName = (this.name || "").trim().toLowerCase();
  next();
});

walletSchema.index({ createdBy: 1, normalizedName: 1 }, { unique: true });

export const Wallet = mongoose.model("Wallet", walletSchema);
