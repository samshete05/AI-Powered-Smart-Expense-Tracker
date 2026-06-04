import { parseSmsText } from "../services/smsParser.js";
import { createHttpError } from "../utils/httpError.js";

export function parseSms(req, res) {
  const { text } = req.body;

  if (!text) {
    throw createHttpError(400, "SMS text is required");
  }

  res.json({
    success: true,
    data: {
      ...parseSmsText(text),
      reviewRequired: true
    }
  });
}
