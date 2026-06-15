import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser } from "../services/api";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError(err.message || "Failed to load user.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function savePreferences(payload) {
    const updated = await updateCurrentUser(payload);
    setUser(updated);
    return updated;
  }

  useEffect(() => {
    load();
  }, [load]);

  return {
    user,
    loading,
    error,
    refetch: load,
    savePreferences
  };
}
