import { useEffect, useState } from "react";
import { getAiInsights, getBudgets, getDashboardSummary } from "../services/api";

const initialData = {
  summary: {
    income: 0,
    expenses: 0,
    balance: 0,
    safeToSpend: 0
  },
  wallets: [],
  budgets: [],
  recentTransactions: [],
  insights: [],
  recurringCandidates: []
};

export function useDashboardData() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [dashboard, budgets, ai] = await Promise.all([getDashboardSummary(), getBudgets(), getAiInsights()]);

      setData({
        summary: dashboard.summary,
        wallets: dashboard.wallets || [],
        recentTransactions: dashboard.recentTransactions || [],
        budgets: budgets || [],
        insights: ai.warnings || [],
        recurringCandidates: ai.recurringCandidates || []
      });
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: load
  };
}
