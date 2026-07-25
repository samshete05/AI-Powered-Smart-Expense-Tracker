import { Router } from "express";
import { getCurrentUserProfile, updateCurrentUserProfile } from "../controllers/userController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/me", asyncHandler(getCurrentUserProfile));
router.patch("/me", asyncHandler(updateCurrentUserProfile));

export default router;
