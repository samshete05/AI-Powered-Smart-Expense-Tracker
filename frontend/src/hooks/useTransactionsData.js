import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  getTransactionAnalytics,
  getTransactions,
  getWallets
} from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

const initialState = {
  transactions: [],
  wallets: [],
  categories: [],
  analytics: {
    chart: [],
    totals: {
      income: 0,
      expense: 0
    },
    count: 0,
    range: "month"
  }
};

export function useTransactionsData(filters, chartRange) {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [transactions, wallets, categories, analytics] = await Promise.all([
        getTransactions(filters),
        getWallets(),
        getCategories(),
        getTransactionAnalytics({ ...filters, range: chartRange })
      ]);

      setData({
        transactions: transactions || [],
        wallets: wallets || [],
        categories: categories || [],
        analytics:
          analytics || {
            chart: [],
            totals: { income: 0, expense: 0 },
            count: 0,
            range: chartRange
          }
      });
    } catch (err) {
      setError(err.message || "Failed to load transactions data.");
    } finally {
      setLoading(false);
    }
  }, [chartRange, filters]);

  useEffect(() => {
    load();

    function handleRefresh() {
      load();
    }

    window.addEventListener(DATA_CHANGED_EVENT, handleRefresh);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handleRefresh);
  }, [load]);

  return {
    data,
    loading,
    error,
    refetch: load
  };
}
