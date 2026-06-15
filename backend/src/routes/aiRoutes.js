import { Router } from "express";
import { chatAssistant, getInsights } from "../controllers/aiController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/insights", asyncHandler(getInsights));
router.post("/chat", asyncHandler(chatAssistant));

export default router;
