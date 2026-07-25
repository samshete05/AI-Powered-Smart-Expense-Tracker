import { useCallback, useEffect, useState } from "react";
import { getTransactions, getWallets } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";

export function useWalletsPageData() {
  const [data, setData] = useState({ wallets: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [wallets, transactions] = await Promise.all([getWallets(), getTransactions()]);
      setData({
        wallets: wallets || [],
        transactions: transactions || []
      });
    } catch (err) {
      setError(err.message || "Failed to load wallets data.");
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
