import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "",
  dbName: process.env.MONGODB_DB_NAME || "ai_powered_expense_tracker",
  devClerkUserId: process.env.DEV_CLERK_USER_ID || "dev-user-001",
  devUserEmail: process.env.DEV_USER_EMAIL || "demo@expense-tracker.local",
  devUserName: process.env.DEV_USER_NAME || "Demo User"
};

export function validateEnv() {
  const missing = [];

  if (!env.mongoUri) {
    missing.push("MONGODB_URI");
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
