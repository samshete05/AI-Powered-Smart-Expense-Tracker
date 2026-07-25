import { useCallback, useEffect, useMemo, useState } from "react";
import { getAiInsights, getBudgets, getGoals, getRecurringExpenses, getWallets } from "../services/api";
import { DATA_CHANGED_EVENT } from "../lib/dataEvents";
import { formatCurrency } from "../lib/formatters";

const LOW_BALANCE_THRESHOLD = 100;

function getDiffInDays(value) {
  const target = new Date(value);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function buildNotifications({ budgets, recurring, wallets, goals, aiWarnings }) {
  const notifications = [];

  budgets.forEach((budget) => {
    const thresholdAmount = Number(budget.limitAmount || 0) * (Number(budget.alertThreshold || 80) / 100);
    if (Number(budget.spent || 0) >= Number(budget.limitAmount || 0) && Number(budget.limitAmount || 0) > 0) {
      notifications.push({
        id: `budget-over-${budget._id}`,
        type: "critical",
        title: `${budget.name} budget exceeded`,
        message: `Spent ${formatCurrency(budget.spent)} against ${formatCurrency(budget.limitAmount)}.`,
        action: "Budget"
      });
    } else if (Number(budget.spent || 0) >= thresholdAmount && thresholdAmount > 0) {
      notifications.push({
        id: `budget-near-${budget._id}`,
        type: "warning",
        title: `${budget.name} is near budget limit`,
        message: `${budget.percentUsed}% used. Alert threshold reached.`,
        action: "Budget"
      });
    }
  });

  recurring.forEach((item) => {
    const daysLeft = getDiffInDays(item.nextPaymentDate);
    if ([3, 2, 1].includes(daysLeft)) {
      notifications.push({
        id: `recurring-${item._id}-${daysLeft}`,
        type: "warning",
        title: `${item.name} due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        message: `${formatCurrency(item.amount)} will be due on ${new Date(item.nextPaymentDate).toLocaleDateString("en-IN")}.`,
        action: "Recurring"
      });
    }
    if (daysLeft === 0) {
      notifications.push({
        id: `recurring-due-${item._id}`,
        type: "critical",
        title: `${item.name} is due today`,
        message: `Recurring payment due today.`,
        action: "Recurring"
      });
    }
  });

  wallets.forEach((wallet) => {
    if (Number(wallet.balance || 0) <= LOW_BALANCE_THRESHOLD) {
      notifications.push({
        id: `wallet-low-${wallet._id}`,
        type: "warning",
        title: `${wallet.name} is low on balance`,
        message: `Only ${formatCurrency(wallet.balance)} left. Low-balance alert at ${formatCurrency(LOW_BALANCE_THRESHOLD)}.`,
        action: "Wallet"
      });
    }
  });

  goals.forEach((goal) => {
    if (!goal.targetDate || goal.status === "completed") return;
    const daysLeft = getDiffInDays(goal.targetDate);
    if ([7, 3, 1].includes(daysLeft)) {
      notifications.push({
        id: `goal-${goal._id}-${daysLeft}`,
        type: "warning",
        title: `${goal.name} target date in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        message: `Saved ${formatCurrency(goal.currentAmount)} of ${formatCurrency(goal.targetAmount)}.`,
        action: "Goal"
      });
    }
    if (daysLeft < 0) {
      notifications.push({
        id: `goal-overdue-${goal._id}`,
        type: "critical",
        title: `${goal.name} target date passed`,
        message: `Review this goal and update your plan.`,
        action: "Goal"
      });
    }
  });

  aiWarnings.forEach((warning, index) => {
    notifications.push({
      id: `ai-warning-${index}`,
      type: "info",
      title: "AI insight",
      message: warning,
      action: "Insights"
    });
  });

  return notifications.sort((left, right) => {
    const weight = { critical: 0, warning: 1, info: 2 };
    return weight[left.type] - weight[right.type];
  });
}

export function useNotifications() {
  const [data, setData] = useState({ items: [], loading: true, error: "" });

  const load = useCallback(async () => {
    setData((current) => ({ ...current, loading: true, error: "" }));

    try {
      const [budgets, recurringData, wallets, goals, ai] = await Promise.all([
        getBudgets(),
        getRecurringExpenses(),
        getWallets(),
        getGoals(),
        getAiInsights()
      ]);

      const items = buildNotifications({
        budgets: budgets || [],
        recurring: recurringData?.items || [],
        wallets: wallets || [],
        goals: goals || [],
        aiWarnings: ai?.warnings || []
      });

      setData({ items, loading: false, error: "" });
    } catch (err) {
      setData({ items: [], loading: false, error: err.message || "Failed to load notifications." });
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

  return useMemo(() => ({
    items: data.items,
    loading: data.loading,
    error: data.error,
    unreadCount: data.items.length,
    refetch: load
  }), [data.error, data.items, data.loading, load]);
}
