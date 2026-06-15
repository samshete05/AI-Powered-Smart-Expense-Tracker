import { useCallback, useEffect, useState } from "react";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../services/api";
import { DATA_CHANGED_EVENT, emitDataChanged } from "../lib/dataEvents";

export function useGoalsData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const goals = await getGoals();
      setData(goals || []);
    } catch (err) {
      setError(err.message || "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function saveGoal(payload) {
    const goal = await createGoal(payload);
    emitDataChanged({ type: "goal-created", goalId: goal?._id });
    await load();
    return goal;
  }

  async function editGoal(id, payload) {
    const goal = await updateGoal(id, payload);
    emitDataChanged({ type: "goal-updated", goalId: id });
    await load();
    return goal;
  }

  async function removeGoal(id) {
    await deleteGoal(id);
    emitDataChanged({ type: "goal-deleted", goalId: id });
    await load();
  }

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
    refetch: load,
    saveGoal,
    editGoal,
    removeGoal
  };
}
