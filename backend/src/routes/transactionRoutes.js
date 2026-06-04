import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionAnalytics,
  listTransactions,
  updateTransaction
} from "../controllers/transactionController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listTransactions));
router.get("/analytics", asyncHandler(getTransactionAnalytics));
router.post("/", asyncHandler(createTransaction));
router.patch("/:id", asyncHandler(updateTransaction));
router.delete("/:id", asyncHandler(deleteTransaction));

export default router;
