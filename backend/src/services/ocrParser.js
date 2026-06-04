export function parseDocumentText({ rawText = "", fileName = "" }) {
  const text = rawText || fileName;
  const amountMatch = text.match(/(?:rs\.?|inr|₹|\$)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const merchantMatch = text.match(/(?:from|at|merchant|store)[:\s]+([A-Za-z0-9&.\- ]{3,40})/i);
  const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);

  return {
    title: merchantMatch ? merchantMatch[1].trim() : fileName || "Scanned document",
    amount: amountMatch ? Number(amountMatch[1].replaceAll(",", "")) : 0,
    type: /salary|credit|refund/i.test(text) ? "income" : "expense",
    date: dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10),
    category: /restaurant|food|swiggy|zomato/i.test(text) ? "Food & Dining" : "General",
    merchant: merchantMatch ? merchantMatch[1].trim() : "",
    rawText
  };
}
