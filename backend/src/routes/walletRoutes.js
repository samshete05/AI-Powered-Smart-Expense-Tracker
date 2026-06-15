import { Router } from "express";
import {
  createWallet,
  deleteWallet,
  listWallets,
  transferBetweenWallets,
  updateWallet
} from "../controllers/walletController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listWallets));
router.post("/", asyncHandler(createWallet));
router.post("/transfer", asyncHandler(transferBetweenWallets));
router.patch("/:id", asyncHandler(updateWallet));
router.delete("/:id", asyncHandler(deleteWallet));

export default router;
