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
      theme: { type: String, default: "dark" }
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
