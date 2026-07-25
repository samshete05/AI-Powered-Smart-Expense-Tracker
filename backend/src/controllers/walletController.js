import { Wallet } from "../models/Wallet.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { processDueRecurringExpenses } from "../services/recurringProcessor.js";
import { createHttpError } from "../utils/httpError.js";
import { Transaction } from "../models/Transaction.js";

export async function listWallets(req, res) {
  const user = await resolveCurrentUser(req);
  await processDueRecurringExpenses(user._id, new Date());
  const wallets = await Wallet.find({ createdBy: user._id, isArchived: false }).sort({ createdAt: -1 });
  res.json({ success: true, data: wallets });
}

export async function createWallet(req, res) {
  const user = await resolveCurrentUser(req);
  const { name, type, balance, currency, color } = req.body;
  const trimmedName = name?.trim();

  if (!trimmedName) {
    throw createHttpError(400, "Wallet name is required");
  } 

  const existingWallet = await Wallet.findOne({
    createdBy: user._id,
    normalizedName: trimmedName.toLowerCase()
  });

  if (existingWallet) {
    throw createHttpError(409, "A wallet with this name already exists");
  }

  const wallet = await Wallet.create({
    createdBy: user._id,
    name: trimmedName,
    type,
    balance: Number(balance || 0),
    currency,
    color
  });

  res.status(201).json({ success: true, data: wallet });
}

export async function updateWallet(req, res) {
  const user = await resolveCurrentUser(req);
  const wallet = await Wallet.findOne({ _id: req.params.id, createdBy: user._id });

  if (!wallet) {
    throw createHttpError(404, "Wallet not found");
  }

  if (typeof req.body.name === "string") {
    const trimmedName = req.body.name.trim();
    if (!trimmedName) {
      throw createHttpError(400, "Wallet name is required");
    }

    const duplicateWallet = await Wallet.findOne({
      _id: { $ne: wallet._id },
      createdBy: user._id,
      normalizedName: trimmedName.toLowerCase()
    });

    if (duplicateWallet) {
      throw createHttpError(409, "A wallet with this name already exists");
    }

    wallet.name = trimmedName;
  }

  ["type", "currency", "color"].forEach((field) => {
    if (typeof req.body[field] === "string") {
      wallet[field] = req.body[field];
    }
  });

  if (req.body.balance !== undefined) {
    wallet.balance = Number(req.body.balance);
  }

  if (typeof req.body.isArchived === "boolean") {
    wallet.isArchived = req.body.isArchived;
  }

  await wallet.save();
  res.json({ success: true, data: wallet });
}

export async function deleteWallet(req, res) {
  const user = await resolveCurrentUser(req);
  const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

  if (!wallet) {
    throw createHttpError(404, "Wallet not found");
  }

  res.json({ success: true, message: "Wallet deleted" });
}

export async function transferBetweenWallets(req, res) {
  const user = await resolveCurrentUser(req);
  const { fromWalletId, toWalletId, amount, note } = req.body;
  const numericAmount = Number(amount);

  if (!fromWalletId || !toWalletId || Number.isNaN(numericAmount) || numericAmount <= 0) {
    throw createHttpError(400, "fromWalletId, toWalletId, and a valid amount are required");
  }

  if (fromWalletId === toWalletId) {
    throw createHttpError(400, "Source and destination wallets must be different");
  }

  const [fromWallet, toWallet] = await Promise.all([
    Wallet.findOne({ _id: fromWalletId, createdBy: user._id }),
    Wallet.findOne({ _id: toWalletId, createdBy: user._id })
  ]);

  if (!fromWallet || !toWallet) {
    throw createHttpError(404, "Wallet not found");
  }

  if (fromWallet.balance < numericAmount) {
    throw createHttpError(400, "Insufficient wallet balance for transfer");
  }

  fromWallet.balance -= numericAmount;
  toWallet.balance += numericAmount;

  await Promise.all([fromWallet.save(), toWallet.save()]);

  const transactionCounts = await Transaction.aggregate([
    {
      $match: {
        createdBy: user._id,
        wallet: { $in: [fromWallet._id, toWallet._id] }
      }
    },
    {
      $group: {
        _id: "$wallet",
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      fromWallet,
      toWallet,
      transfer: {
        amount: numericAmount,
        note: note || ""
      },
      transactionCounts
    }
  });
}
