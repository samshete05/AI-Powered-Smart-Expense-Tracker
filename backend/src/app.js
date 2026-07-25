import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { attachAuthContext } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Welcome to AI Powered Expense Tracker API"
    });
  });

  app.use("/api/health", healthRoutes); 
  app.use("/api", attachAuthContext);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/automation", automationRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/recurring", recurringRoutes);
  app.use("/api/wallets", walletRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/budgets", budgetRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/ocr", ocrRoutes);
  app.use("/api/sms", smsRoutes);
  app.use("/api/email", emailRoutes);
  app.use("/api/ai", aiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
