import { Router } from "express";
import { createBudget, deleteBudget, listBudgets, updateBudget } from "../controllers/budgetController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listBudgets));
router.post("/", asyncHandler(createBudget));
router.patch("/:id", asyncHandler(updateBudget));
router.delete("/:id", asyncHandler(deleteBudget));

export default router;
