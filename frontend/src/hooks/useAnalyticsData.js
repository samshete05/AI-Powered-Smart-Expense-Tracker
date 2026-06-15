import { useCallback, useEffect, useState } from "react";
import { getAnalyticsSummary } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

const initialData = {
  expenseSummary: {
    total: 0,
    categories: 0,
    dailyAverage: 0,
    health: "No spend"
  },
  expenseBreakdown: {
    range: "monthly",
    bars: [],
    donut: []
  },
  recurringSummary: {
    monthlyRecurring: 0,
    activeCount: 0,
    byType: [],
    donut: []
  },
  comparison: {
    yearA: new Date().getFullYear() - 1,
    yearB: new Date().getFullYear(),
    series: []
  }
};

export function useAnalyticsData(filters) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const analytics = await getAnalyticsSummary(filters);
      setData(analytics || initialData);
    } catch (err) {
      setError(err.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
