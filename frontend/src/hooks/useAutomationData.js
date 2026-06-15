import { useCallback, useEffect, useState } from "react";
import { getAutomationRules, getCategories, getRecurringReminders, getWallets } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

const initialState = {
  wallets: [],
  categories: [],
  rules: [],
  reminders: []
};

export function useAutomationData() {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [wallets, categories, rules, reminders] = await Promise.all([
        getWallets(),
        getCategories(),
        getAutomationRules(),
        getRecurringReminders({ days: 10 })
      ]);

      setData({
        wallets: wallets || [],
        categories: categories || [],
        rules: rules || [],
        reminders: reminders || []
      });
    } catch (err) {
      setError(err.message || "Failed to load automation data.");
    } finally {
      setLoading(false);
    }
  }, []);

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
