import { Wallet } from "../models/Wallet.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

export async function listWallets(req, res) {
  const user = await resolveCurrentUser(req);
  const wallets = await Wallet.find({ createdBy: user._id, isArchived: false }).sort({ createdAt: -1 });
  res.json({ success: true, data: wallets });
}

export async function createWallet(req, res) {
  const user = await resolveCurrentUser(req);
  const { name, type, balance, currency, color } = req.body;

  if (!name) {
    throw createHttpError(400, "Wallet name is required");
  }

  const wallet = await Wallet.create({
    createdBy: user._id,
    name,
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

  ["name", "type", "currency", "color"].forEach((field) => {
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
