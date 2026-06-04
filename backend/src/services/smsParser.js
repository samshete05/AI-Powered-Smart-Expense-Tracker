export function parseSmsText(text = "") {
  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const debitMatch = /\b(debited|spent|paid|purchase|txn)\b/i.test(text);
  const creditMatch = /\b(credited|received|salary|refund)\b/i.test(text);
  const upiMerchant = text.match(/(?:to|at|from)\s+([A-Za-z0-9&.\- ]{3,40})/i);
  const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);

  const amount = amountMatch ? Number(amountMatch[1].replaceAll(",", "")) : 0;
  const type = creditMatch && !debitMatch ? "income" : "expense";
  const merchant = upiMerchant ? upiMerchant[1].trim() : "SMS import";
  const normalizedText = text.toLowerCase();

  let category = "General";
  if (/upi|gpay|phonepe|paytm/i.test(text)) category = "Transfers";
  if (/fuel|petrol|diesel/i.test(text)) category = "Transport";
  if (/swiggy|zomato|restaurant|food/i.test(text)) category = "Food & Dining";
  if (/netflix|spotify|prime|subscription/i.test(text)) category = "Entertainment";
  if (/salary|bonus|incentive/i.test(text)) category = "Salary";

  return {
    title: merchant,
    amount,
    type,
    date: dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10),
    category,
    merchant,
    confidence: normalizedText.length > 12 ? "medium" : "low",
    rawText: text
  };
}
