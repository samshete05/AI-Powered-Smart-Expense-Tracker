import { Router } from "express";
import { parseReceipt, uploadReceipt } from "../controllers/ocrController.js";

const router = Router();

router.post("/parse", uploadReceipt, parseReceipt);

export default router;
