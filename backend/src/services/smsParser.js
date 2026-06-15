import { extractAmount, extractDate, extractMerchant, inferCategory, inferType, scoreConfidence } from "./parserUtils.js";
import { normalizeMerchantName } from "./merchantNormalizer.js";

export function parseSmsText(text = "") {
  const amount = extractAmount(text);
  const type = inferType(text, "expense");
  const merchant = normalizeMerchantName(extractMerchant(text, "SMS import"));
  const category = inferCategory(text, type === "income" ? "Salary" : "General");

  return {
    title: merchant,
    amount,
    type,
    date: extractDate(text),
    category,
    merchant,
    confidence: scoreConfidence(text, amount, merchant, category),
    rawText: text
  };
}
