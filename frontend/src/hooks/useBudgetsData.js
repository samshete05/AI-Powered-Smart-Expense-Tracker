import { useCallback, useEffect, useState } from "react";
import { getBudgets, getCategories } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

export function useBudgetsData() {
  const [data, setData] = useState({ budgets: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [budgets, categories] = await Promise.all([getBudgets(), getCategories()]);
      setData({
        budgets: budgets || [],
        categories: (categories || []).filter((category) => category.type === "expense")
      });
    } catch (err) {
      setError(err.message || "Failed to load budgets data.");
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

  return { data, loading, error, refetch: load };
}
