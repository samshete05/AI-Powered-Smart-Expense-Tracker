import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Transaction } from "../models/Transaction.js";
import { Wallet } from "../models/Wallet.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function isValidObjectId(value) {
  return value && mongoose.Types.ObjectId.isValid(value);
}

async function validateOwnership(model, id, userId, label) {
  if (!id) return null;
  if (!isValidObjectId(id)) {
    throw createHttpError(400, `Invalid ${label} id`);
  }

  const record = await model.findOne({ _id: id, createdBy: userId });
  if (!record) {
    throw createHttpError(404, `${label} not found`);
  }

  return record;
}

function getSignedAmount(type, amount) {
  return type === "income" ? Number(amount) : -Number(amount);
}

async function applyWalletDelta(walletId, delta) {
  if (!walletId || !delta) return;
  await Wallet.findByIdAndUpdate(walletId, { $inc: { balance: delta } });
}

function getDateRange(range, startDate, endDate) {
  const now = new Date();

  if (range === "day") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start, end: new Date(start.getTime() + DAY_MS) };
  }

  if (range === "week") {
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
    return { start, end: new Date(start.getTime() + 7 * DAY_MS) };
  }

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  }

  if (range === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end: new Date(now.getFullYear() + 1, 0, 1) };
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(new Date(endDate).getTime() + DAY_MS) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  return null;
}

function buildBucketKey(date, range) {
  const value = new Date(date);

  if (range === "year") {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  }

  return value.toISOString().slice(0, 10);
}

function buildBucketLabel(key, range) {
  if (range === "year") {
    const [year, month] = key.split("-");
    return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(Number(year), Number(month) - 1, 1));
  }

  const date = new Date(key);

  if (range === "month" || range === "week") {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
  }

  if (range === "day") {
    return new Intl.DateTimeFormat("en-IN", { hour: "2-digit" }).format(date);
  }

  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}

export async function listTransactions(req, res) {
  const user = await resolveCurrentUser(req);
  const filters = { createdBy: user._id };
  const { search, walletId, walletType, categoryId, type, range, startDate, endDate } = req.query;

  if (type) {
    filters.type = type;
  }

  if (walletId && isValidObjectId(walletId)) {
    filters.wallet = walletId;
  }

  if (categoryId && isValidObjectId(categoryId)) {
    filters.category = categoryId;
  }

  const dateRange = getDateRange(range, startDate, endDate);
  if (dateRange) {
    filters.transactionDate = {
      $gte: dateRange.start,
      $lt: dateRange.end
    };
  }

  if (search) {
    const trimmed = search.trim();
    const searchRegex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const searchAmount = Number(trimmed);
    filters.$or = [
      { note: searchRegex },
      { merchant: searchRegex },
      { description: searchRegex }
    ];

    if (!Number.isNaN(searchAmount) && trimmed !== "") {
      filters.$or.push({ amount: searchAmount });
    }
  }

  let transactions = await Transaction.find(filters)
    .populate("wallet", "name type")
    .populate("category", "name type color")
    .sort({ transactionDate: -1, createdAt: -1 });

  if (walletType) {
    transactions = transactions.filter((transaction) => transaction.wallet?.type === walletType);
  }

  res.json({ success: true, data: transactions });
}

export async function createTransaction(req, res) {
  const user = await resolveCurrentUser(req);
  const { walletId, categoryId, type, amount, note, merchant, description, source, transactionDate, rawText } = req.body;

  if (!type || !["income", "expense"].includes(type)) {
    throw createHttpError(400, "Transaction type must be income or expense");
  }

  if (Number(amount) <= 0) {
    throw createHttpError(400, "Amount must be greater than zero");
  }

  const wallet = await validateOwnership(Wallet, walletId, user._id, "Wallet");
  const category = await validateOwnership(Category, categoryId, user._id, "Category");

  const transaction = await Transaction.create({
    createdBy: user._id,
    wallet: wallet?._id,
    category: category?._id,
    type,
    amount: Number(amount),
    note,
    merchant,
    description,
    source: source || "manual",
    transactionDate: transactionDate || new Date(),
    rawText: rawText || ""
  });

  await applyWalletDelta(wallet?._id, getSignedAmount(type, amount));

  const populated = await transaction.populate([
    { path: "wallet", select: "name type" },
    { path: "category", select: "name type color" }
  ]);

  res.status(201).json({ success: true, data: populated });
}

export async function updateTransaction(req, res) {
  const user = await resolveCurrentUser(req);
  const transaction = await Transaction.findOne({ _id: req.params.id, createdBy: user._id });

  if (!transaction) {
    throw createHttpError(404, "Transaction not found");
  }

  const previousWalletId = transaction.wallet ? String(transaction.wallet) : null;
  const previousSignedAmount = getSignedAmount(transaction.type, transaction.amount);

  if (req.body.walletId) {
    const wallet = await validateOwnership(Wallet, req.body.walletId, user._id, "Wallet");
    transaction.wallet = wallet._id;
  }

  if (req.body.categoryId) {
    const category = await validateOwnership(Category, req.body.categoryId, user._id, "Category");
    transaction.category = category._id;
  }

  if (req.body.type) transaction.type = req.body.type;
  if (req.body.amount) transaction.amount = Number(req.body.amount);
  if (typeof req.body.note === "string") transaction.note = req.body.note;
  if (typeof req.body.merchant === "string") transaction.merchant = req.body.merchant;
  if (typeof req.body.description === "string") transaction.description = req.body.description;
  if (req.body.transactionDate) transaction.transactionDate = req.body.transactionDate;

  await transaction.save();

  const nextWalletId = transaction.wallet ? String(transaction.wallet) : null;
  const nextSignedAmount = getSignedAmount(transaction.type, transaction.amount);

  if (previousWalletId && previousWalletId === nextWalletId) {
    await applyWalletDelta(nextWalletId, nextSignedAmount - previousSignedAmount);
  } else {
    await applyWalletDelta(previousWalletId, -previousSignedAmount);
    await applyWalletDelta(nextWalletId, nextSignedAmount);
  }

  const populated = await transaction.populate([
    { path: "wallet", select: "name type" },
    { path: "category", select: "name type color" }
  ]);

  res.json({ success: true, data: populated });
}

export async function deleteTransaction(req, res) {
  const user = await resolveCurrentUser(req);
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

  if (!transaction) {
    throw createHttpError(404, "Transaction not found");
  }

  await applyWalletDelta(transaction.wallet, -getSignedAmount(transaction.type, transaction.amount));

  res.json({ success: true, message: "Transaction deleted" });
}

export async function getTransactionAnalytics(req, res) {
  const user = await resolveCurrentUser(req);
  const range = req.query.range || "month";
  const filters = { createdBy: user._id };
  const dateRange = getDateRange(range, req.query.startDate, req.query.endDate);

  if (dateRange) {
    filters.transactionDate = {
      $gte: dateRange.start,
      $lt: dateRange.end
    };
  }

  if (req.query.walletId && isValidObjectId(req.query.walletId)) {
    filters.wallet = req.query.walletId;
  }

  if (req.query.categoryId && isValidObjectId(req.query.categoryId)) {
    filters.category = req.query.categoryId;
  }

  if (req.query.type) {
    filters.type = req.query.type;
  }

  let transactions = await Transaction.find(filters).sort({ transactionDate: 1 });

  if (req.query.walletType) {
    const wallets = await Wallet.find({ createdBy: user._id, type: req.query.walletType }).select("_id");
    const walletIds = new Set(wallets.map((wallet) => String(wallet._id)));
    transactions = transactions.filter((transaction) => walletIds.has(String(transaction.wallet)));
  }

  const bucketMap = new Map();
  const totals = { income: 0, expense: 0 };

  transactions.forEach((transaction) => {
    const key = buildBucketKey(transaction.transactionDate, range);
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        key,
        label: buildBucketLabel(key, range),
        income: 0,
        expense: 0
      });
    }

    const bucket = bucketMap.get(key);
    bucket[transaction.type] += transaction.amount;
    totals[transaction.type] += transaction.amount;
  });

  res.json({
    success: true,
    data: {
      range,
      chart: Array.from(bucketMap.values()),
      totals,
      count: transactions.length
    }
  });
}
