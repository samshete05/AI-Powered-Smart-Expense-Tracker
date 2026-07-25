const aliasPatterns = [
  { pattern: /\bamzn\b|\bamazon seller services\b|\bamazon pay\b/i, replacement: "Amazon" },
  { pattern: /\bswiggy\b/i, replacement: "Swiggy" },
  { pattern: /\bzomato\b/i, replacement: "Zomato" },
  { pattern: /\buber\b/i, replacement: "Uber" },
  { pattern: /\bola\b/i, replacement: "Ola" },
  { pattern: /\bphonepe\b/i, replacement: "PhonePe" },
  { pattern: /\bgpay\b|\bgoogle pay\b/i, replacement: "Google Pay" },
  { pattern: /\bpaytm\b/i, replacement: "Paytm" },
  { pattern: /\bnetflix\b/i, replacement: "Netflix" },
  { pattern: /\bspotify\b/i, replacement: "Spotify" }
];

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeMerchantName(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const alias = aliasPatterns.find((item) => item.pattern.test(trimmed));
  if (alias) return alias.replacement;

  const cleaned = trimmed
    .replace(/\b(upi|txn|debit|credit|payment|pay|india|ltd|limited|pvt|private|ref|utr|id)\b/gi, " ")
    .replace(/[_\-./]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return toTitleCase(cleaned || trimmed);
}
