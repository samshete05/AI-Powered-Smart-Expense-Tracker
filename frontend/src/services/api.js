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

export function getCurrentUser() {
  return request("/users/me");
}

export function updateCurrentUser(payload) {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getBudgets() {
  return request("/budgets");
}

export function getAiInsights() {
  return request("/ai/insights");
}

export function askAiAssistant(payload) {
  return request("/ai/chat", {
    method: "POST",
    body: JSON.stringify(payload)
  });
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

export function deleteWallet(id) {
  return request(`/wallets/${id}`, {
    method: "DELETE"
  });
}

export function transferBetweenWallets(payload) {
  return request("/wallets/transfer", {
    method: "POST",
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

export function updateCategory(id, payload) {
  return request(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: "DELETE"
  });
}

export function getRecurringExpenses(params = {}) {
  return request(`/recurring${buildQuery(params)}`);
}

export function createRecurringExpense(payload) {
  return request("/recurring", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteRecurringExpense(id) {
  return request(`/recurring/${id}`, {
    method: "DELETE"
  });
}

export function getAnalyticsSummary(params = {}) {
  return request(`/analytics${buildQuery(params)}`);
}

export function parseSmsText(payload) {
  return request("/sms/parse", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function parseReceipt(payload) {
  const formData = new FormData();
  if (payload.file) formData.append("file", payload.file);
  if (payload.rawText) formData.append("rawText", payload.rawText);
  if (payload.fileName) formData.append("fileName", payload.fileName);

  return request("/ocr/parse", {
    method: "POST",
    body: formData
  });
}

export function parseEmailInvoice(payload) {
  return request("/email/parse", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAutomationRules() {
  return request("/automation/rules");
}

export function createAutomationRule(payload) {
  return request("/automation/rules", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAutomationRule(id, payload) {
  return request(`/automation/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAutomationRule(id) {
  return request(`/automation/rules/${id}`, {
    method: "DELETE"
  });
}

export function getRecurringReminders(params = {}) {
  return request(`/automation/reminders${buildQuery(params)}`);
}

export function createBudget(payload) {
  return request("/budgets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateBudget(id, payload) {
  return request(`/budgets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteBudget(id) {
  return request(`/budgets/${id}`, {
    method: "DELETE"
  });
}

export function getGoals() {
  return request("/goals");
}

export function createGoal(payload) {
  return request("/goals", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateGoal(id, payload) {
  return request(`/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteGoal(id) {
  return request(`/goals/${id}`, {
    method: "DELETE"
  });
}
