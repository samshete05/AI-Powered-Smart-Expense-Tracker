import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Category } from "../models/Category.js";
import { Transaction } from "../models/Transaction.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { processDueRecurringExpenses } from "../services/recurringProcessor.js";
import { createHttpError } from "../utils/httpError.js";

export async function listBudgets(req, res) {
  const user = await resolveCurrentUser(req);
  await processDueRecurringExpenses(user._id, new Date());
  const budgets = await Budget.find({ createdBy: user._id })
    .populate("category", "name color")
    .sort({ month: -1, createdAt: -1 });

  const enhanced = await Promise.all(
    budgets.map(async (budget) => {
      const [year, month] = budget.month.split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));

      const totals = await Transaction.aggregate([
        {
          $match: {
            createdBy: new mongoose.Types.ObjectId(user._id),
            category: budget.category?._id,
            type: "expense",
            transactionDate: { $gte: start, $lt: end }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const spent = totals[0]?.total || 0;

      return {
        ...budget.toObject(),
        spent,
        remaining: Math.max(budget.limitAmount - spent, 0),
        percentUsed: budget.limitAmount ? Math.round((spent / budget.limitAmount) * 100) : 0
      };
    })
  );

  res.json({ success: true, data: enhanced });
}

export async function createBudget(req, res) {
  const user = await resolveCurrentUser(req);
  const { categoryId, name, month, limitAmount, alertThreshold } = req.body;

  if (!categoryId || !month || Number(limitAmount) <= 0) {
    throw createHttpError(400, "categoryId, month, and limitAmount are required");
  }

  const category = await Category.findOne({ _id: categoryId, createdBy: user._id });
  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  const budget = await Budget.create({
    createdBy: user._id,
    category: category._id,
    name: name || category.name,
    month,
    limitAmount: Number(limitAmount),
    alertThreshold: Number(alertThreshold || 80)
  });

  const populated = await budget.populate("category", "name color");
  res.status(201).json({ success: true, data: populated });
}

export async function updateBudget(req, res) {
  const user = await resolveCurrentUser(req);
  const budget = await Budget.findOne({ _id: req.params.id, createdBy: user._id });

  if (!budget) {
    throw createHttpError(404, "Budget not found");
  }

  ["name", "month"].forEach((field) => {
    if (typeof req.body[field] === "string") {
      budget[field] = req.body[field];
    }
  });

  if (req.body.limitAmount !== undefined) {
    budget.limitAmount = Number(req.body.limitAmount);
  }

  if (req.body.alertThreshold !== undefined) {
    budget.alertThreshold = Number(req.body.alertThreshold);
  }

  await budget.save();
  const populated = await budget.populate("category", "name color");
  res.json({ success: true, data: populated });
}

export async function deleteBudget(req, res) {
  const user = await resolveCurrentUser(req);
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

  if (!budget) {
    throw createHttpError(404, "Budget not found");
  }

  res.json({ success: true, message: "Budget deleted" });
}
