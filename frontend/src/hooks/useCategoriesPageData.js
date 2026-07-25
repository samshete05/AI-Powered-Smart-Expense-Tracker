import { useCallback, useEffect, useState } from "react";
import { getCategories } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

export function useCategoriesPageData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const categories = await getCategories();
      setData(categories || []);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
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
