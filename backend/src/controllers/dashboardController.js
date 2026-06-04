import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Goal } from "../models/Goal.js";
import { Transaction } from "../models/Transaction.js";
import { Wallet } from "../models/Wallet.js";
import { resolveCurrentUser } from "../services/currentUser.js";

export async function getDashboardSummary(req, res) {
  const user = await resolveCurrentUser(req);
  const userId = new mongoose.Types.ObjectId(user._id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totals, recentTransactions, wallets, budgets, goals, categoryBreakdown] = await Promise.all([
    Transaction.aggregate([
      { $match: { createdBy: userId, transactionDate: { $gte: monthStart, $lt: nextMonthStart } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]),
    Transaction.find({ createdBy: user._id })
      .populate("category", "name")
      .populate("wallet", "name")
      .sort({ transactionDate: -1 })
      .limit(5),
    Wallet.find({ createdBy: user._id, isArchived: false }).sort({ createdAt: -1 }).limit(5),
    Budget.find({ createdBy: user._id, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` }),
    Goal.find({ createdBy: user._id, status: "active" }).sort({ createdAt: -1 }).limit(4),
    Transaction.aggregate([
      { $match: { createdBy: userId, type: "expense", transactionDate: { $gte: monthStart, $lt: nextMonthStart } } },
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
      { $sort: { total: -1 } },
      { $limit: 5 }
    ])
  ]);

  const income = totals.find((item) => item._id === "income")?.total || 0;
  const expenses = totals.find((item) => item._id === "expense")?.total || 0;
  const budgetLimit = budgets.reduce((sum, item) => sum + item.limitAmount, 0);
  const remainingBudget = Math.max(budgetLimit - expenses, 0);
  const remainingDays = Math.max(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(), 1);
  const safeToSpend = remainingBudget > 0 ? Number((remainingBudget / remainingDays).toFixed(2)) : 0;

  res.json({
    success: true,
    data: {
      summary: {
        income,
        expenses,
        balance: income - expenses,
        budgetLimit,
        remainingBudget,
        safeToSpend
      },
      wallets,
      goals: goals.map((goal) => ({
        ...goal.toObject(),
        progressPercent: goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
      })),
      recentTransactions,
      categoryBreakdown
    }
  });
}
