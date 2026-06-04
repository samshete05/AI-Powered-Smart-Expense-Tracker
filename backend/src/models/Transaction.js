import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    note: {
      type: String,
      trim: true,
      default: ""
    },
    merchant: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    source: {
      type: String,
      enum: ["manual", "ocr", "sms", "import"],
      default: "manual"
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    rawText: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ createdBy: 1, transactionDate: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
