import multer from "multer";
import { parseDocumentText } from "../services/ocrParser.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadReceipt = upload.single("file");

export function parseReceipt(req, res) {
  const rawText = req.body.rawText || "";
  const fileName = req.file?.originalname || req.body.fileName || "receipt";
  const parsed = parseDocumentText({ rawText, fileName });

  res.json({
    success: true,
    data: {
      ...parsed,
      reviewRequired: true
    }
  });
}
