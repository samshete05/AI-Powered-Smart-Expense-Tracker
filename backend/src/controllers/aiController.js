import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { answerFinanceQuestion, gatherFinanceContext } from "../services/aiInsightsService.js";
import { createHttpError } from "../utils/httpError.js";

export async function getInsights(req, res) {
  const user = await resolveCurrentUser(req);
  const context = await gatherFinanceContext(user._id, new Date());
  const warnings = [
    ...context.patternInsights,
    `Financial health is ${context.health.label} at ${context.health.score}/100.`
  ];

  if (context.expenseCategories[0]) {
    warnings.unshift(`Highest spend category this month: ${context.expenseCategories[0].name}.`);
  }

  if (context.recurringCandidates.length) {
    warnings.unshift(`Detected ${context.recurringCandidates.length} likely recurring subscription charges.`);
  }

  res.json({
    success: true,
    data: {
      summary: "Finance assistant insights grounded in live transaction behavior.",
      warnings,
      recurringCandidates: context.recurringCandidates.map((item) => ({
        _id: { merchant: item.name, amount: item.amount },
        count: item.count
      })),
      categorySpend: context.expenseCategories,
      budgetRecommendations: context.budgetRecommendations,
      savingsInsights: context.savingsInsights,
      patternInsights: context.patternInsights,
      anomalies: context.anomalies,
      forecast: context.forecast,
      financialHealth: context.health
    }
  });
}

export async function chatAssistant(req, res) {
  const user = await resolveCurrentUser(req);
  const { message } = req.body;

  if (!message || !String(message).trim()) {
    throw createHttpError(400, "message is required");
  }

  const context = await gatherFinanceContext(user._id, new Date());
  const answer = answerFinanceQuestion(message, context);

  res.json({
    success: true,
    data: {
      answer,
      financialHealth: context.health,
      forecast: context.forecast,
      anomalies: context.anomalies.slice(0, 5),
      budgetRecommendations: context.budgetRecommendations.slice(0, 4),
      savingsInsights: context.savingsInsights
    }
  });
}
