import { extractAmount, extractDate, extractMerchant, inferCategory, scoreConfidence } from "./parserUtils.js";
import { normalizeMerchantName } from "./merchantNormalizer.js";

export function parseEmailInvoice({ subject = "", from = "", body = "" }) {
  const rawText = `${subject}\n${from}\n${body}`.trim();
  const merchant = normalizeMerchantName(extractMerchant(`${subject}\n${body}`, from || "Email invoice"));
  const amount = extractAmount(rawText);
  const category = inferCategory(rawText, "Bills");
  let recurringType = "bills";

  if (/netflix|spotify|prime|youtube|subscription|plan renewal|membership/i.test(rawText)) {
    recurringType = "subscriptions";
  } else if (/emi|loan|instalment|installment/i.test(rawText)) {
    recurringType = "emis";
  }

  return {
    title: merchant || subject || "Email invoice",
    amount,
    type: "expense",
    date: extractDate(rawText),
    category,
    merchant,
    recurringType,
    confidence: scoreConfidence(rawText, amount, merchant, category),
    rawText
  };
}
