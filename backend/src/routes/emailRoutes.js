import { Router } from "express";
import { parseEmail } from "../controllers/emailController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/parse", asyncHandler(parseEmail));

export default router;
