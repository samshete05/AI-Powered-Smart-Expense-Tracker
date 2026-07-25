import { Router } from "express";
import {
  createAutomationRule,
  deleteAutomationRule,
  listAutomationRules,
  listRecurringReminders,
  updateAutomationRule
} from "../controllers/automationController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/rules", asyncHandler(listAutomationRules));
router.post("/rules", asyncHandler(createAutomationRule));
router.patch("/rules/:id", asyncHandler(updateAutomationRule));
router.delete("/rules/:id", asyncHandler(deleteAutomationRule));
router.get("/reminders", asyncHandler(listRecurringReminders));

export default router;
