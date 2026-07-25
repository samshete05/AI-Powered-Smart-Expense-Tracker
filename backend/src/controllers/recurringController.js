import { RecurringExpense } from "../models/RecurringExpense.js";
import { Transaction } from "../models/Transaction.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { processDueRecurringExpenses } from "../services/recurringProcessor.js";
import { createHttpError } from "../utils/httpError.js";

const intervalByFrequency = {
  monthly: 1,
  quarterly: 3,
  yearly: 12
};

const annualMultiplier = {
  monthly: 12,
  quarterly: 4,
  yearly: 1
};

function getMonthBounds(referenceDateValue) {
  const referenceDate = referenceDateValue ? new Date(referenceDateValue) : new Date();
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  return { referenceDate, start, end };
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

function getOccurrenceForMonth(item, monthStart) {
  const firstPaymentDate = new Date(item.firstPaymentDate);
  const diff = monthDiff(firstPaymentDate, monthStart);

  if (diff < 0) return null;

  const interval = intervalByFrequency[item.frequency] || 1;
  if (diff % interval !== 0) return null;

  const occurrenceDate = buildOccurrenceDate(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    item.dayOfMonth
  );

  if (diff === 0 && occurrenceDate < firstPaymentDate) return null;
  return occurrenceDate;
}

function getNextOccurrence(item, referenceDateValue = new Date()) {
  const referenceDate = new Date(referenceDateValue);
  const monthCursor = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

  for (let index = 0; index < 36; index += 1) {
    const candidateMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + index, 1);
    const occurrence = getOccurrenceForMonth(item, candidateMonth);
    if (occurrence && occurrence >= new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())) {
      return occurrence;
    }
  }

  return null;
}

function mapRecurringItem(item, monthStart, referenceDate) {
  const occurrenceInMonth = getOccurrenceForMonth(item, monthStart);
  const nextPaymentDate = getNextOccurrence(item, referenceDate);
  const annualForecast = item.amount * (annualMultiplier[item.frequency] || 1);

  return {
    ...item.toObject(),
    occurrenceInMonth,
    nextPaymentDate,
    annualForecast,
    isDueInSelectedMonth: Boolean(occurrenceInMonth)
  };
}

export async function listRecurringExpenses(req, res) {
  const user = await resolveCurrentUser(req);
  await processDueRecurringExpenses(user._id, new Date());
  const { referenceDate, status = "active" } = req.query;
  const { referenceDate: parsedReferenceDate, start: monthStart, end: monthEnd } = getMonthBounds(referenceDate);

  const filters = { createdBy: user._id };
  if (status !== "all") {
    filters.status = status;
  }

  const [recurringExpenses, transactionTotals] = await Promise.all([
    RecurringExpense.find(filters).sort({ createdAt: -1 }),
    Transaction.aggregate([
      {
        $match: {
          createdBy: user._id,
          transactionDate: { $gte: monthStart, $lt: monthEnd }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ])
  ]);
  const mappedItems = recurringExpenses.map((item) => mapRecurringItem(item, monthStart, parsedReferenceDate));

  const monthlyTotal = mappedItems
    .filter((item) => item.frequency === "monthly" && item.isDueInSelectedMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  const quarterlyTotal = mappedItems
    .filter((item) => item.frequency === "quarterly" && item.isDueInSelectedMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  const yearlyTotal = mappedItems
    .filter((item) => item.frequency === "yearly" && item.isDueInSelectedMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  const yearlyForecast = mappedItems.reduce((sum, item) => sum + item.annualForecast, 0);
  const projectedExpense = mappedItems
    .filter((item) => item.isDueInSelectedMonth)
    .reduce((sum, item) => sum + item.amount, 0);
  const monthIncome = transactionTotals.find((item) => item._id === "income")?.total || 0;
  const monthExpense = transactionTotals.find((item) => item._id === "expense")?.total || 0;
  const projectedBalance = monthIncome - (monthExpense + projectedExpense);

  const upcomingPayments = mappedItems
    .filter((item) => item.nextPaymentDate)
    .sort((left, right) => new Date(left.nextPaymentDate) - new Date(right.nextPaymentDate))
    .slice(0, 8);

  const groups = ["subscriptions", "bills", "emis", "other"].map((type) => {
    const items = mappedItems.filter((item) => item.type === type);
    return {
      type,
      total: items.filter((item) => item.isDueInSelectedMonth).reduce((sum, item) => sum + item.amount, 0),
      items
    };
  });

  res.json({
    success: true,
    data: {
      summary: {
        monthlyTotal,
        monthlyCount: mappedItems.filter((item) => item.frequency === "monthly" && item.status === "active").length,
        quarterlyTotal,
        quarterlyCount: mappedItems.filter((item) => item.frequency === "quarterly" && item.isDueInSelectedMonth).length,
        yearlyTotal,
        yearlyCount: mappedItems.filter((item) => item.frequency === "yearly" && item.isDueInSelectedMonth).length,
        yearlyForecast,
        projectedExpense,
        monthIncome,
        monthExpense,
        projectedBalance
      },
      selectedMonth: monthStart,
      upcomingPayments,
      groups,
      items: mappedItems
    }
  });
}

export async function createRecurringExpense(req, res) {
  const user = await resolveCurrentUser(req);
  const { type, name, amount, frequency, dayOfMonth, firstPaymentDate, notes, status } = req.body;

  if (!type || !name || Number(amount) <= 0 || !firstPaymentDate) {
    throw createHttpError(400, "type, name, amount, and firstPaymentDate are required");
  }

  const recurringExpense = await RecurringExpense.create({
    createdBy: user._id,
    type,
    name,
    amount: Number(amount),
    frequency: frequency || "monthly",
    dayOfMonth: Number(dayOfMonth || new Date(firstPaymentDate).getDate()),
    firstPaymentDate,
    notes: notes || "",
    status: status || "active"
  });

  res.status(201).json({ success: true, data: recurringExpense });
}

export async function updateRecurringExpense(req, res) {
  const user = await resolveCurrentUser(req);
  const recurringExpense = await RecurringExpense.findOne({
    _id: req.params.id,
    createdBy: user._id
  });

  if (!recurringExpense) {
    throw createHttpError(404, "Recurring expense not found");
  }

  ["type", "name", "frequency", "notes", "status"].forEach((field) => {
    if (typeof req.body[field] === "string") {
      recurringExpense[field] = req.body[field];
    }
  });

  if (req.body.amount !== undefined) recurringExpense.amount = Number(req.body.amount);
  if (req.body.dayOfMonth !== undefined) recurringExpense.dayOfMonth = Number(req.body.dayOfMonth);
  if (req.body.firstPaymentDate) recurringExpense.firstPaymentDate = req.body.firstPaymentDate;

  await recurringExpense.save();
  res.json({ success: true, data: recurringExpense });
}

export async function deleteRecurringExpense(req, res) {
  const user = await resolveCurrentUser(req);
  const recurringExpense = await RecurringExpense.findOneAndDelete({
    _id: req.params.id,
    createdBy: user._id
  });

  if (!recurringExpense) {
    throw createHttpError(404, "Recurring expense not found");
  }

  res.json({ success: true, message: "Recurring expense deleted" });
}
