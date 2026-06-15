const CATEGORY_RULES = [
  { category: "Transport", patterns: [/uber/i, /ola/i, /rapido/i, /metro/i, /irctc/i, /fuel/i, /petrol/i, /diesel/i, /parking/i, /fastag/i] },
  { category: "Food", patterns: [/swiggy/i, /zomato/i, /restaurant/i, /food/i, /cafe/i, /dining/i] },
  { category: "Bills", patterns: [/electricity/i, /water/i, /gas/i, /broadband/i, /internet/i, /postpaid/i, /bill/i, /utility/i] },
  { category: "Entertainment", patterns: [/netflix/i, /spotify/i, /prime/i, /youtube/i, /movie/i, /subscription/i, /membership/i] },
  { category: "Shopping", patterns: [/amazon/i, /flipkart/i, /myntra/i, /store/i, /mall/i, /purchase/i] },
  { category: "Salary", patterns: [/salary/i, /payroll/i, /bonus/i, /incentive/i] },
  { category: "Transfers", patterns: [/upi/i, /phonepe/i, /gpay/i, /paytm/i, /neft/i, /imps/i, /rtgs/i, /transfer/i] }
];

export function normalizeAmount(value) {
  if (!value) return 0;
  return Number(String(value).replaceAll(",", "").trim());
}

export function extractAmount(text = "") {
  const patterns = [
    /(?:rs\.?|inr|\u20B9)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount|amt|total|debited by|credited by)[:\s]*([\d,]+(?:\.\d{1,2})?)/i,
    /\b([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|\u20B9)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return normalizeAmount(match[1]);
  }

  return 0;
}

export function normalizeDateInput(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const match = String(value).match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (!match) return new Date().toISOString().slice(0, 10);

  const [, first, second, third] = match;
  const year = third.length === 2 ? `20${third}` : third;
  const month = Number(first) > 12 ? second : first;
  const day = Number(first) > 12 ? first : second;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function extractDate(text = "") {
  const patterns = [
    /\b(\d{4}-\d{2}-\d{2})\b/,
    /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/,
    /\b(?:dated?|on|due|txn date|payment date|bill date)[:\s-]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return normalizeDateInput(match[1]);
  }

  return new Date().toISOString().slice(0, 10);
}

export function inferType(text = "", fallback = "expense") {
  if (/\b(credited|received|salary|refund|cashback|deposit)\b/i.test(text)) return "income";
  if (/\b(debited|spent|paid|purchase|withdrawn|sent)\b/i.test(text)) return "expense";
  return fallback;
}

export function inferCategory(text = "", fallback = "General") {
  const hit = CATEGORY_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  return hit?.category || fallback;
}

export function extractMerchant(text = "", fallback = "") {
  const patterns = [
    /(?:to|at|from)\s+([A-Za-z0-9&.\- ]{3,60})/i,
    /(?:merchant|store|vendor|billed by)[:\s]+([A-Za-z0-9&.\- ]{3,60})/i,
    /(?:invoice\s*(?:from|for)?|payment to)\s*([A-Za-z0-9&.\- ]{3,60})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return fallback;
}

export function scoreConfidence(text = "", amount = 0, merchant = "", category = "") {
  let score = 0;
  if (text.trim().length > 20) score += 1;
  if (amount > 0) score += 1;
  if (merchant) score += 1;
  if (category && category !== "General") score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
