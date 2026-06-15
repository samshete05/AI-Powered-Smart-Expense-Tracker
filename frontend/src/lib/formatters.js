let activeCurrency = "INR";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export function setGlobalCurrency(currency) {
  activeCurrency = currency || "INR";
}

export function getGlobalCurrency() {
  return activeCurrency;
}

export function formatCurrency(value, currency = activeCurrency) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  } catch {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  }
}

export function formatDate(value) {
  if (!value) return "No date";
  return dateFormatter.format(new Date(value));
}
