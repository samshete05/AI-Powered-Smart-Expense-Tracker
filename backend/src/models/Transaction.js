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
      enum: ["manual", "ocr", "sms", "import", "email", "automation", "recurring"],
      default: "manual"
    },
    recurringExpense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringExpense"
    },
    recurringOccurrenceDate: {
      type: Date
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
transactionSchema.index(
  { createdBy: 1, recurringExpense: 1, recurringOccurrenceDate: 1 },
  { unique: true, partialFilterExpression: { recurringExpense: { $exists: true }, recurringOccurrenceDate: { $exists: true } } }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
