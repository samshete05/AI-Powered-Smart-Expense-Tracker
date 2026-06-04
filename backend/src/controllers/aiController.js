import mongoose from "mongoose";
import { Transaction } from "../models/Transaction.js";
import { resolveCurrentUser } from "../services/currentUser.js";

export async function getInsights(req, res) {
  const user = await resolveCurrentUser(req);
  const userId = new mongoose.Types.ObjectId(user._id);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [recurringCandidates, categorySpend] = await Promise.all([
    Transaction.aggregate([
      { $match: { createdBy: userId, type: "expense", transactionDate: { $gte: ninetyDaysAgo } } },
      {
        $group: {
          _id: {
            merchant: "$merchant",
            amount: "$amount"
          },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gte: 2 }, "_id.merchant": { $ne: "" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Transaction.aggregate([
      { $match: { createdBy: userId, type: "expense", transactionDate: { $gte: ninetyDaysAgo } } },
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
      { $limit: 4 }
    ])
  ]);

  const warnings = [];

  if (recurringCandidates.length) {
    warnings.push(`Detected ${recurringCandidates.length} likely recurring subscription charges.`);
  }

  if (categorySpend[0]) {
    warnings.push(`Highest spend category in the last 90 days: ${categorySpend[0]._id || "Uncategorized"}.`);
  }

  res.json({
    success: true,
    data: {
      summary: "Rule-based AI insights generated from recent transaction behavior.",
      warnings,
      recurringCandidates,
      categorySpend
    }
  });
}
