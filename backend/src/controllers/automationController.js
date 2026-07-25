import { AutomationRule } from "../models/AutomationRule.js";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function buildDueDate(item, cursorDate) {
  return new Date(cursorDate.getFullYear(), cursorDate.getMonth(), Math.min(item.dayOfMonth, daysInMonth(cursorDate.getFullYear(), cursorDate.getMonth())));
}

function getUpcomingDate(item, today, horizonDays) {
  for (let offset = 0; offset <= 2; offset += 1) {
    const cursorDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const dueDate = buildDueDate(item, cursorDate);
    const diffDays = Math.ceil((dueDate - today) / (24 * 60 * 60 * 1000));

    if (diffDays >= 0 && diffDays <= horizonDays) {
      return { dueDate, diffDays };
    }
  }

  return null;
}

export async function listAutomationRules(req, res) {
  const user = await resolveCurrentUser(req);
  const rules = await AutomationRule.find({ createdBy: user._id })
    .populate("category", "name type color icon")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: rules });
}

export async function createAutomationRule(req, res) {
  const user = await resolveCurrentUser(req);
  const { name, merchantContains, categoryId, appliesToType = "expense" } = req.body;

  if (!name?.trim() || !merchantContains?.trim() || !categoryId) {
    throw createHttpError(400, "name, merchantContains, and categoryId are required");
  }

  const rule = await AutomationRule.create({
    createdBy: user._id,
    name: name.trim(),
    merchantContains: merchantContains.trim(),
    category: categoryId,
    appliesToType
  });

  const populated = await rule.populate("category", "name type color icon");
  res.status(201).json({ success: true, data: populated });
}

export async function updateAutomationRule(req, res) {
  const user = await resolveCurrentUser(req);
  const rule = await AutomationRule.findOne({ _id: req.params.id, createdBy: user._id });

  if (!rule) {
    throw createHttpError(404, "Automation rule not found");
  }

  ["name", "merchantContains", "appliesToType"].forEach((field) => {
    if (typeof req.body[field] === "string" && req.body[field].trim()) {
      rule[field] = req.body[field].trim();
    }
  });

  if (req.body.categoryId) {
    rule.category = req.body.categoryId;
  }

  if (typeof req.body.isActive === "boolean") {
    rule.isActive = req.body.isActive;
  }

  await rule.save();
  const populated = await rule.populate("category", "name type color icon");
  res.json({ success: true, data: populated });
}

export async function deleteAutomationRule(req, res) {
  const user = await resolveCurrentUser(req);
  const deletedRule = await AutomationRule.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

  if (!deletedRule) {
    throw createHttpError(404, "Automation rule not found");
  }

  res.json({ success: true, message: "Automation rule deleted" });
}

export async function listRecurringReminders(req, res) {
  const user = await resolveCurrentUser(req);
  const horizonDays = Math.min(Math.max(Number(req.query.days || 7), 1), 60);
  const today = startOfToday();
  const recurring = await RecurringExpense.find({
    createdBy: user._id,
    status: "active"
  }).sort({ amount: -1 });

  const reminders = recurring
    .map((item) => {
      const due = getUpcomingDate(item, today, horizonDays);
      if (!due) return null;
      return {
        id: String(item._id),
        name: item.name,
        type: item.type,
        amount: item.amount,
        frequency: item.frequency,
        dueDate: due.dueDate,
        dueInDays: due.diffDays
      };
    })
    .filter(Boolean)
    .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate));

  res.json({ success: true, data: reminders });
}
