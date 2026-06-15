import { Router } from "express";
import { getAnalyticsSummary } from "../controllers/analyticsController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getAnalyticsSummary));

export default router;
