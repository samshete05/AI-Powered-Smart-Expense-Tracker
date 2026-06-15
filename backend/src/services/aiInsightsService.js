import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Goal } from "../models/Goal.js";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { Transaction } from "../models/Transaction.js";
import { computeFinancialHealth } from "./financialHealth.js";
import { normalizeMerchantName } from "./merchantNormalizer.js";

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function titleCase(value = "") {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCategoryBuckets(transactions) {
  const map = new Map();
  transactions.forEach((transaction) => {
    const key = transaction.category?.name || "Uncategorized";
    if (!map.has(key)) {
      map.set(key, { name: key, amount: 0, count: 0 });
    }
    const bucket = map.get(key);
    bucket.amount += Number(transaction.amount || 0);
    bucket.count += 1;
  });
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function buildMerchantBuckets(transactions) {
  const map = new Map();
  transactions.forEach((transaction) => {
    const key = normalizeMerchantName(transaction.merchant || transaction.note || "Unknown");
    if (!map.has(key)) {
      map.set(key, { name: key, amount: 0, count: 0 });
    }
    const bucket = map.get(key);
    bucket.amount += Number(transaction.amount || 0);
    bucket.count += 1;
  });
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function detectWeekendOverspend(transactions) {
  let weekend = 0;
  let weekday = 0;
  transactions.forEach((transaction) => {
    const day = new Date(transaction.transactionDate).getDay();
    if (day === 0 || day === 6) weekend += Number(transaction.amount || 0);
    else weekday += Number(transaction.amount || 0);
  });
  return weekend > weekday * 0.55;
}

function detectFoodSpike(transactions) {
  const foodKeywords = /(swiggy|zomato|food|restaurant|cafe)/i;
  const total = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const food = transactions
    .filter((item) => foodKeywords.test(item.merchant || "") || item.category?.name === "Food")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return total > 0 && food / total >= 0.25;
}

function detectSubscriptionGrowth(recurringItems) {
  return recurringItems.filter((item) => item.type === "subscriptions").length >= 3;
}

function detectAnomalies(transactions) {
  const merchantGroups = new Map();
  transactions.forEach((transaction) => {
    const merchant = normalizeMerchantName(transaction.merchant || transaction.note || "Unknown");
    if (!merchantGroups.has(merchant)) merchantGroups.set(merchant, []);
    merchantGroups.get(merchant).push(transaction);
  });

  const anomalies = [];
  merchantGroups.forEach((items, merchant) => {
    const amounts = items.map((item) => Number(item.amount || 0));
    const med = median(amounts);
    items.forEach((item) => {
      const amount = Number(item.amount || 0);
      if (med > 0 && amount >= med * 2.2) {
        anomalies.push({
          id: String(item._id),
          merchant,
          amount,
          date: item.transactionDate,
          note: item.note || ""
        });
      }
    });
  });

  return anomalies.sort((a, b) => b.amount - a.amount).slice(0, 6);
}

function buildForecast(transactions, now = new Date()) {
  const monthStart = startOfMonth(now);
  const nextMonth = endOfMonth(now);
  const daysPassed = Math.max(Math.floor((startOfDay(now) - monthStart) / (24 * 60 * 60 * 1000)) + 1, 1);
  const daysInCurrentMonth = Math.floor((nextMonth - monthStart) / (24 * 60 * 60 * 1000));
  const total = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const dailyRunRate = total / daysPassed;
  return {
    spentSoFar: total,
    dailyRunRate,
    projectedEndOfMonth: Math.round(dailyRunRate * daysInCurrentMonth)
  };
}

function buildBudgetRecommendations(categories) {
  return categories.slice(0, 4).map((category) => ({
    category: category.name,
    recommendedLimit: Math.round(category.amount * 1.08),
    basedOn: `Based on ${category.count} recent transactions`
  }));
}

function buildSavingsInsights(categories) {
  const cuttable = categories.filter((item) => ["Food", "Entertainment", "Shopping"].includes(item.name));
  const top = cuttable.slice(0, 3);
  const monthlySavings = Math.round(top.reduce((sum, item) => sum + item.amount * 0.12, 0));

  return {
    areas: top.map((item) => `${item.name}: cut about 12% from ${item.amount}`),
    estimatedMonthlySavings: monthlySavings
  };
}

function buildPatternInsights(transactions, recurringItems) {
  const insights = [];
  if (detectWeekendOverspend(transactions)) {
    insights.push("Weekend spending is materially higher than weekday spend.");
  }
  if (detectFoodSpike(transactions)) {
    insights.push("Food delivery is taking a large share of monthly expenses.");
  }
  if (detectSubscriptionGrowth(recurringItems)) {
    insights.push("Subscription count is growing and needs review.");
  }
  return insights;
}

function buildWarnings({ recurringCandidates, categoryBuckets, anomalies, health }) {
  const warnings = [];
  if (recurringCandidates.length) {
    warnings.push(`Detected ${recurringCandidates.length} likely recurring subscription charges.`);
  }
  if (categoryBuckets[0]) {
    warnings.push(`Highest spend category this month: ${categoryBuckets[0].name}.`);
  }
  if (anomalies.length) {
    warnings.push(`Found ${anomalies.length} unusual transaction${anomalies.length === 1 ? "" : "s"} worth reviewing.`);
  }
  warnings.push(`Financial health is currently ${health.label} with a score of ${health.score}/100.`);
  return warnings;
}

export async function gatherFinanceContext(userId, now = new Date()) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);

  const [monthTransactions, ninetyDayTransactions, budgets, goals, recurringItems, totals] = await Promise.all([
    Transaction.find({
      createdBy: userId,
      type: "expense",
      transactionDate: { $gte: currentMonthStart, $lt: currentMonthEnd }
    }).populate("category", "name"),
    Transaction.find({
      createdBy: userId,
      transactionDate: { $gte: ninetyDaysAgo, $lt: currentMonthEnd }
    }).populate("category", "name"),
    Budget.find({ createdBy: userId, month: monthKey(now) }).populate("category", "name"),
    Goal.find({ createdBy: userId }).sort({ createdAt: -1 }),
    RecurringExpense.find({ createdBy: userId, status: "active" }).sort({ createdAt: -1 }),
    Transaction.aggregate([
      { $match: { createdBy: userObjectId, transactionDate: { $gte: currentMonthStart, $lt: currentMonthEnd } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ])
  ]);

  const expenseCategories = buildCategoryBuckets(monthTransactions);
  const merchantSpend = buildMerchantBuckets(monthTransactions);
  const anomalies = detectAnomalies(ninetyDayTransactions.filter((item) => item.type === "expense"));
  const forecast = buildForecast(monthTransactions, now);
  const budgetRecommendations = buildBudgetRecommendations(expenseCategories);
  const savingsInsights = buildSavingsInsights(expenseCategories);
  const patternInsights = buildPatternInsights(monthTransactions, recurringItems);
  const recurringCandidates = buildMerchantBuckets(
    ninetyDayTransactions.filter((item) => item.type === "expense")
  ).filter((item) => item.count >= 2 && item.name !== "Unknown").slice(0, 5);

  const income = totals.find((item) => item._id === "income")?.total || 0;
  const expenses = totals.find((item) => item._id === "expense")?.total || 0;
  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.limitAmount || 0), 0);
  const budgetUsage = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;
  const recurringMonthly = recurringItems.reduce((sum, item) => {
    if (item.frequency === "yearly") return sum + Number(item.amount || 0) / 12;
    if (item.frequency === "quarterly") return sum + Number(item.amount || 0) / 3;
    return sum + Number(item.amount || 0);
  }, 0);
  const savingsRatio = income > 0 ? Math.max((income - expenses) / income, 0) : 0;
  const recurringLoadRatio = income > 0 ? recurringMonthly / income : 0;
  const health = computeFinancialHealth({ income, expenses, budgetUsage, recurringLoadRatio, savingsRatio });

  return {
    now,
    monthTransactions,
    budgets,
    goals,
    recurringItems,
    expenseCategories,
    merchantSpend,
    anomalies,
    forecast,
    budgetRecommendations,
    savingsInsights,
    patternInsights,
    recurringCandidates,
    totals: { income, expenses, totalBudget, recurringMonthly },
    health
  };
}

function answerGoalPlanning(message, context) {
  const match = message.match(/save\s+([\d,]+)\s+in\s+(\d+)\s*(month|months)/i);
  if (!match) return null;
  const target = Number(match[1].replaceAll(",", ""));
  const months = Number(match[2]);
  const monthlyNeed = months > 0 ? Math.ceil(target / months) : 0;
  const currentSavings = Math.max(context.totals.income - context.totals.expenses, 0);
  const gap = Math.max(monthlyNeed - currentSavings, 0);

  return `To save ${target.toLocaleString("en-IN")} in ${months} months, you need about ${monthlyNeed.toLocaleString("en-IN")} per month. Based on current behavior, you are keeping roughly ${Math.round(currentSavings).toLocaleString("en-IN")} per month, so you need to free up about ${Math.round(gap).toLocaleString("en-IN")} more each month.`;
}

export function answerFinanceQuestion(message, context) {
  const query = String(message || "").trim().toLowerCase();
  if (!query) {
    return "Ask about monthly spending, savings, unusual transactions, budgets, goals, forecasts, or financial health.";
  }

  const goalPlan = answerGoalPlanning(query, context);
  if (goalPlan) return goalPlan;

  if (/(spend|spent).*(most|highest)/i.test(query)) {
    const topCategory = context.expenseCategories[0];
    const topMerchant = context.merchantSpend[0];
    if (!topCategory) return "I could not find enough spending data for this month yet.";
    return `This month your highest spend category is ${topCategory.name} at ${topCategory.amount.toLocaleString("en-IN")}. Your highest merchant spend is ${topMerchant?.name || "Unknown"} at ${Math.round(topMerchant?.amount || 0).toLocaleString("en-IN")}.`;
  }

  if (/reduce|cut|save more|savings/i.test(query)) {
    const areas = context.savingsInsights.areas.length
      ? context.savingsInsights.areas.join(" ")
      : "There is not enough discretionary spend yet to estimate clear cuts.";
    return `${areas} Estimated monthly savings opportunity: ${context.savingsInsights.estimatedMonthlySavings.toLocaleString("en-IN")}.`;
  }

  if (/unusual|suspicious|anomaly/i.test(query)) {
    if (!context.anomalies.length) return "I did not find any strong unusual transactions in recent history.";
    const sample = context.anomalies.slice(0, 3).map((item) => `${item.merchant} for ${item.amount.toLocaleString("en-IN")}`).join(", ");
    return `I found ${context.anomalies.length} unusual transactions worth checking. Examples: ${sample}.`;
  }

  if (/budget|limit/i.test(query)) {
    if (!context.budgetRecommendations.length) return "I do not have enough category history yet to suggest realistic budget limits.";
    return `Recommended monthly limits based on recent behavior: ${context.budgetRecommendations.map((item) => `${item.category} around ${item.recommendedLimit.toLocaleString("en-IN")}`).join(", ")}.`;
  }

  if (/pattern|trend|weekend|food|subscription/i.test(query)) {
    if (!context.patternInsights.length) return "I do not see a strong spending pattern yet from current history.";
    return context.patternInsights.join(" ");
  }

  if (/forecast|end of month|month end|project/i.test(query)) {
    return `At the current run rate, projected end-of-month spending is about ${context.forecast.projectedEndOfMonth.toLocaleString("en-IN")}. You have spent ${context.forecast.spentSoFar.toLocaleString("en-IN")} so far this month.`;
  }

  if (/health|score/i.test(query)) {
    return `Your financial health is ${context.health.label} at ${context.health.score}/100. Spending discipline is ${context.health.drivers.spendingDiscipline}/100, savings strength is ${context.health.drivers.savingsStrength}/100, and recurring commitment pressure is ${context.health.drivers.recurringCommitment}/100.`;
  }

  if (/(goal|plan)/i.test(query)) {
    const activeGoal = context.goals.find((goal) => goal.status === "active");
    if (!activeGoal) return "You do not have an active goal yet. Create one and I can suggest a savings plan.";
    const remaining = Math.max(Number(activeGoal.targetAmount || 0) - Number(activeGoal.currentAmount || 0), 0);
    return `Your latest active goal is ${activeGoal.name}. You still need ${remaining.toLocaleString("en-IN")} to reach the target. Tell me a timeline like "save 50000 in 6 months" and I will map the monthly adjustment.`;
  }

  return "Sorry, I couldn't answer that. I can only help with spending, savings, budgets, goals, recurring bills, unusual transactions, forecasts, and financial health inside this app.";
}

