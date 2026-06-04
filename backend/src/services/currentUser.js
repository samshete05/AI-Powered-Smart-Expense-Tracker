import { Category } from "../models/Category.js";
import { User } from "../models/User.js";

const defaultCategories = [
  { name: "Salary", type: "income", color: "#16a34a", icon: "wallet", isSystem: true },
  { name: "Freelance", type: "income", color: "#0284c7", icon: "briefcase", isSystem: true },
  { name: "Investments", type: "income", color: "#7c3aed", icon: "chart", isSystem: true },
  { name: "General", type: "expense", color: "#6b7280", icon: "circle", isSystem: true },
  { name: "Food", type: "expense", color: "#f97316", icon: "utensils", isSystem: true },
  { name: "Transport", type: "expense", color: "#0ea5e9", icon: "car", isSystem: true },
  { name: "Shopping", type: "expense", color: "#ec4899", icon: "bag", isSystem: true },
  { name: "Bills", type: "expense", color: "#eab308", icon: "receipt", isSystem: true }
];

export async function resolveCurrentUser(req) {
  const user = await User.findOneAndUpdate(
    { clerkUserId: req.auth.clerkUserId },
    {
      clerkUserId: req.auth.clerkUserId,
      email: req.auth.email,
      fullName: req.auth.fullName
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  const categoryCount = await Category.countDocuments({ createdBy: user._id });
  if (!categoryCount) {
    await Category.insertMany(
      defaultCategories.map((category) => ({
        ...category,
        createdBy: user._id
      }))
    );
  }

  return user;
}
