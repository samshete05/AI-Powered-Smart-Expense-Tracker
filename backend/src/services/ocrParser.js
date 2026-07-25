import { extractAmount, extractDate, extractMerchant, inferCategory, inferType, scoreConfidence } from "./parserUtils.js";
import { normalizeMerchantName } from "./merchantNormalizer.js";

export function parseDocumentText({ rawText = "", fileName = "" }) {
  const text = `${rawText}\n${fileName}`.trim();
  const merchant = normalizeMerchantName(extractMerchant(text, fileName || "Scanned document"));
  const amount = extractAmount(text);
  const type = inferType(text, "expense");
  const category = inferCategory(text, "General");

  return {
    title: merchant,
    amount,
    type,
    date: extractDate(text),
    category,
    merchant,
    confidence: scoreConfidence(text, amount, merchant, category),
    rawText
  };
}
