import { Goal } from "../models/Goal.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

export async function listGoals(req, res) {
  const user = await resolveCurrentUser(req);
  const goals = await Goal.find({ createdBy: user._id }).sort({ createdAt: -1 });

  const mapped = goals.map((goal) => ({
    ...goal.toObject(),
    progressPercent: goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
  }));

  res.json({ success: true, data: mapped });
}

export async function createGoal(req, res) {
  const user = await resolveCurrentUser(req);
  const { name, targetAmount, currentAmount, targetDate, status } = req.body;

  if (!name || Number(targetAmount) <= 0) {
    throw createHttpError(400, "Goal name and targetAmount are required");
  }

  const goal = await Goal.create({
    createdBy: user._id,
    name,
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount || 0),
    targetDate,
    status
  });

  res.status(201).json({
    success: true,
    data: {
      ...goal.toObject(),
      progressPercent: goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
    }
  });
}

export async function updateGoal(req, res) {
  const user = await resolveCurrentUser(req);
  const goal = await Goal.findOne({ _id: req.params.id, createdBy: user._id });

  if (!goal) {
    throw createHttpError(404, "Goal not found");
  }

  ["name", "status"].forEach((field) => {
    if (typeof req.body[field] === "string") {
      goal[field] = req.body[field];
    }
  });

  if (req.body.targetAmount !== undefined) {
    goal.targetAmount = Number(req.body.targetAmount);
  }

  if (req.body.currentAmount !== undefined) {
    goal.currentAmount = Number(req.body.currentAmount);
  }

  if (req.body.targetDate) {
    goal.targetDate = req.body.targetDate;
  }

  await goal.save();
  res.json({
    success: true,
    data: {
      ...goal.toObject(),
      progressPercent: goal.targetAmount ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
    }
  });
}

export async function deleteGoal(req, res) {
  const user = await resolveCurrentUser(req);
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

  if (!goal) {
    throw createHttpError(404, "Goal not found");
  }

  res.json({ success: true, message: "Goal deleted" });
}
