import mongoose from "mongoose";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { Transaction } from "../models/Transaction.js";
import { gatherFinanceContext } from "../services/aiInsightsService.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { processDueRecurringExpenses } from "../services/recurringProcessor.js";

const rangeMap = {
  weekly: 7,
  monthly: 31,
  yearly: 365
};

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getExpenseRangeBounds(range, customStart, customEnd) {
  const now = new Date();

  if (range === "custom" && customStart && customEnd) {
    return {
      start: startOfDay(new Date(customStart)),
      end: new Date(new Date(customEnd).getFullYear(), new Date(customEnd).getMonth(), new Date(customEnd).getDate() + 1)
    };
  }

  if (range === "yearly") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear() + 1, 0, 1)
    };
  }

  const days = rangeMap[range] || 31;
  const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)));
  return {
    start,
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  };
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildOccurrenceDate(year, month, day) {
  return new Date(year, month, Math.min(day, daysInMonth(year, month)));
}

function monthDiff(fromDate, toDate) {
  return (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());
}

function recurringOccursInMonth(item, monthDate) {
  const intervalByFrequency = {
    monthly: 1,
    quarterly: 3,
    yearly: 12
  };

  const firstPaymentDate = new Date(item.firstPaymentDate);
  const diff = monthDiff(firstPaymentDate, monthDate);
  if (diff < 0) return false;

  const interval = intervalByFrequency[item.frequency] || 1;
  if (diff % interval !== 0) return false;

  const occurrenceDate = buildOccurrenceDate(monthDate.getFullYear(), monthDate.getMonth(), item.dayOfMonth);
  if (diff === 0 && occurrenceDate < firstPaymentDate) return false;
  return true;
}

export async function getAnalyticsSummary(req, res) {
  const user = await resolveCurrentUser(req);
  await processDueRecurringExpenses(user._id, new Date());
  const userId = new mongoose.Types.ObjectId(user._id);
  const { range = "monthly", customStart, customEnd, compareYearA, compareYearB } = req.query;
  const { start, end } = getExpenseRangeBounds(range, customStart, customEnd);

  const [expenseCategoryTotals, expenseTotalAgg, categoryCountAgg, recurringItems, comparisonTransactions, financeContext] =
    await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            createdBy: userId,
            type: "expense",
            transactionDate: { $gte: start, $lt: end }
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$category.name",
            total: { $sum: "$amount" }
          }
        },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            createdBy: userId,
            type: "expense",
            transactionDate: { $gte: start, $lt: end }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            createdBy: userId,
            type: "expense",
            transactionDate: { $gte: start, $lt: end }
          }
        },
        {
          $group: {
            _id: "$category"
          }
        },
        { $count: "count" }
      ]),
      RecurringExpense.find({ createdBy: user._id, status: "active" }),
      Transaction.find({ createdBy: user._id, type: "expense" })
        .populate("category", "name")
        .sort({ transactionDate: 1 }),
      gatherFinanceContext(user._id, new Date())
    ]);

  const totalExpenses = expenseTotalAgg[0]?.total || 0;
  const categoryCount = categoryCountAgg[0]?.count || 0;
  const dayCount = Math.max(Math.ceil((end - start) / (24 * 60 * 60 * 1000)), 1);
  const dailyAverage = totalExpenses / dayCount;

  const expenseBars = expenseCategoryTotals.map((item) => ({
    category: item._id || "Uncategorized",
    amount: item.total
  }));

  const expenseDonut = expenseCategoryTotals.map((item) => ({
    name: item._id || "Uncategorized",
    amount: item.total,
    percent: totalExpenses ? Math.round((item.total / totalExpenses) * 100) : 0
  }));

  const health =
    totalExpenses === 0 ? "No spend"
    : dailyAverage < 500 ? "Good"
    : dailyAverage < 1500 ? "Moderate"
    : "Poor";

  const recurringByType = ["subscriptions", "bills", "emis", "other"].map((type) => ({
    type,
    count: recurringItems.filter((item) => item.type === type).length
  }));

  const recurringMonthlyTotal = recurringItems.reduce((sum, item) => {
    if (item.frequency === "monthly") return sum + item.amount;
    if (item.frequency === "quarterly") return sum + item.amount / 3;
    if (item.frequency === "yearly") return sum + item.amount / 12;
    return sum;
  }, 0);

  const recurringDonut = recurringByType
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.type,
      count: item.count
    }));

  const yearA = Number(compareYearA || new Date().getFullYear() - 1);
  const yearB = Number(compareYearB || new Date().getFullYear());
  const comparison = Array.from({ length: 12 }, (_, monthIndex) => {
    const label = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(2026, monthIndex, 1));
    const totals = { label, [yearA]: 0, [yearB]: 0 };

    comparisonTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.transactionDate);
      const year = transactionDate.getFullYear();
      const month = transactionDate.getMonth();

      if (month === monthIndex && (year === yearA || year === yearB)) {
        totals[year] += transaction.amount;
      }
    });

    return totals;
  });

  res.json({
    success: true,
    data: {
      expenseSummary: {
        total: totalExpenses,
        categories: categoryCount,
        dailyAverage,
        health,
        financialHealth: financeContext.health
      },
      expenseBreakdown: {
        range,
        bars: expenseBars,
        donut: expenseDonut
      },
      recurringSummary: {
        monthlyRecurring: recurringMonthlyTotal,
        activeCount: recurringItems.length,
        byType: recurringByType,
        donut: recurringDonut
      },
      comparison: {
        yearA,
        yearB,
        series: comparison
      }
    }
  });
}
