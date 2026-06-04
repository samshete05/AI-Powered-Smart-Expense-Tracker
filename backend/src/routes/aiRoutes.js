import { Router } from "express";
import { getInsights } from "../controllers/aiController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/insights", asyncHandler(getInsights));

export default router;
