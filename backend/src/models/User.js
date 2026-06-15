import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    fullName: {
      type: String,
      trim: true
    },
    preferences: {
      currency: { type: String, default: "INR" },
      theme: { type: String, default: "dark" },
      onboardingCompleted: { type: Boolean, default: false },
      focusAreas: [{ type: String }],
      incomeRange: { type: String, default: "" },
      onboardingNotes: { type: String, default: "" }
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
