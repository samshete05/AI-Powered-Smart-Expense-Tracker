import { Router } from "express";
import {
  createRecurringExpense,
  deleteRecurringExpense,
  listRecurringExpenses,
  updateRecurringExpense
} from "../controllers/recurringController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listRecurringExpenses));
router.post("/", asyncHandler(createRecurringExpense));
router.patch("/:id", asyncHandler(updateRecurringExpense));
router.delete("/:id", asyncHandler(deleteRecurringExpense));

export default router;
