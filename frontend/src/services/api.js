const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "x-clerk-user-id": "dev-user-001",
      "x-user-email": "demo@expense-tracker.local",
      "x-user-name": "Demo User",
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed for ${path}`);
  }

  return payload?.data;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getDashboardSummary() {
  return request("/dashboard");
}

export function getBudgets() {
  return request("/budgets");
}

export function getAiInsights() {
  return request("/ai/insights");
}

export function getTransactions(params = {}) {
  return request(`/transactions${buildQuery(params)}`);
}

export function getTransactionAnalytics(params = {}) {
  return request(`/transactions/analytics${buildQuery(params)}`);
}

export function createTransaction(payload) {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTransaction(id, payload) {
  return request(`/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, {
    method: "DELETE"
  });
}

export function getWallets() {
  return request("/wallets");
}

export function createWallet(payload) {
  return request("/wallets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateWallet(id, payload) {
  return request(`/wallets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getCategories() {
  return request("/categories");
}

export function createCategory(payload) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
