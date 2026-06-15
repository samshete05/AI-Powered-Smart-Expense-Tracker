import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["subscriptions", "bills", "emis", "other"],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    frequency: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly"
    },
    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    firstPaymentDate: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

recurringExpenseSchema.index({ createdBy: 1, type: 1, frequency: 1 });

export const RecurringExpense = mongoose.model("RecurringExpense", recurringExpenseSchema);
