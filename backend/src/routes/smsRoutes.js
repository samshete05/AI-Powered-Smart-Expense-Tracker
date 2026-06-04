import { Router } from "express";
import { parseSms } from "../controllers/smsController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/parse", asyncHandler(parseSms));

export default router;
