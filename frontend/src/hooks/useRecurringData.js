import { useCallback, useEffect, useState } from "react";
import { getRecurringExpenses } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

const initialState = {
  summary: {
    monthlyTotal: 0,
    monthlyCount: 0,
    quarterlyTotal: 0,
    quarterlyCount: 0,
    yearlyTotal: 0,
    yearlyCount: 0,
    yearlyForecast: 0,
    projectedExpense: 0,
    monthIncome: 0,
    monthExpense: 0,
    projectedBalance: 0
  },
  selectedMonth: null,
  upcomingPayments: [],
  groups: [],
  items: []
};

export function useRecurringData(referenceDate) {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const recurring = await getRecurringExpenses({ referenceDate });
      setData(recurring || initialState);
    } catch (err) {
      setError(err.message || "Failed to load recurring data.");
    } finally {
      setLoading(false);
    }
  }, [referenceDate]);

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
