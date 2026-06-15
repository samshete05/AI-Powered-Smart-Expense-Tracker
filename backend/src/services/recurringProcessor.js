import { RecurringExpense } from "../models/RecurringExpense.js";
import { Transaction } from "../models/Transaction.js";
import { resolveCategoryByName } from "./automationEngine.js";

const intervalByFrequency = {
  monthly: 1,
  quarterly: 3,
  yearly: 12
};

const defaultCategoryByType = {
  subscriptions: "Entertainment",
  bills: "Bills",
  emis: "Bills",
  other: "General"
};

function startOfDay(dateValue) {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(dateValue) {
  const date = new Date(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), 1);
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

  const occurrenceDate = buildOccurrenceDate(monthStart.getFullYear(), monthStart.getMonth(), item.dayOfMonth);
  if (diff === 0 && occurrenceDate < firstPaymentDate) return null;
  return occurrenceDate;
}

function buildOccurrenceKey(recurringExpenseId, occurrenceDate) {
  return `${String(recurringExpenseId)}::${startOfDay(occurrenceDate).toISOString()}`;
}

export async function processDueRecurringExpenses(userId, upToDateValue = new Date()) {
  const upToDate = startOfDay(upToDateValue);
  const recurringItems = await RecurringExpense.find({
    createdBy: userId,
    status: "active",
    firstPaymentDate: { $lte: upToDate }
  }).sort({ createdAt: 1 });

  if (!recurringItems.length) {
    return { createdCount: 0 };
  }

  const earliestFirstPayment = recurringItems.reduce((earliest, item) => {
    const value = new Date(item.firstPaymentDate);
    return !earliest || value < earliest ? value : earliest;
  }, null);

  const existingTransactions = await Transaction.find({
    createdBy: userId,
    source: "recurring",
    recurringOccurrenceDate: {
      $gte: startOfMonth(earliestFirstPayment),
      $lte: upToDate
    }
  }).select("recurringExpense recurringOccurrenceDate");

  const existingKeys = new Set(
    existingTransactions.map((transaction) =>
      buildOccurrenceKey(transaction.recurringExpense, transaction.recurringOccurrenceDate)
    )
  );

  const transactionsToCreate = [];

  for (const item of recurringItems) {
    const monthCursor = startOfMonth(item.firstPaymentDate);
    const targetMonth = startOfMonth(upToDate);
    const categoryName = defaultCategoryByType[item.type] || "General";
    const matchedCategory = await resolveCategoryByName(userId, categoryName, "expense");

    for (
      let cursor = new Date(monthCursor);
      cursor <= targetMonth;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    ) {
      const occurrenceDate = getOccurrenceForMonth(item, cursor);
      if (!occurrenceDate || occurrenceDate > upToDate) continue;

      const occurrenceKey = buildOccurrenceKey(item._id, occurrenceDate);
      if (existingKeys.has(occurrenceKey)) continue;

      existingKeys.add(occurrenceKey);
      transactionsToCreate.push({
        createdBy: item.createdBy,
        category: matchedCategory?._id,
        type: "expense",
        amount: Number(item.amount),
        note: item.name,
        merchant: item.name,
        description: item.notes || `Recurring ${item.type} charge`,
        source: "recurring",
        recurringExpense: item._id,
        recurringOccurrenceDate: startOfDay(occurrenceDate),
        transactionDate: startOfDay(occurrenceDate),
        rawText: ""
      });
    }
  }

  if (transactionsToCreate.length) {
    try {
      await Transaction.insertMany(transactionsToCreate, { ordered: false });
    } catch (error) {
      const duplicateOnly =
        error?.code === 11000
        || (error?.writeErrors || []).every((writeError) => writeError.code === 11000);

      if (!duplicateOnly) {
        throw error;
      }
    }
  }

  return { createdCount: transactionsToCreate.length };
}
