import { useMemo, useState } from "react";
import { createBudget, deleteBudget } from "../../services/api";
import { emitDataChanged } from "../../lib/dataEvents";
import { formatCurrency } from "../../lib/formatters";
import { useBudgetsData } from "../../hooks/useBudgetsData";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { BudgetFormModal } from "./BudgetFormModal";
import { useToast } from "../ui/ToastProvider";

function getBudgetStatus(percentUsed) {
  if (percentUsed >= 100) return { label: "Exceeded", tone: "bg-rose-100 text-rose-600" };
  if (percentUsed >= 80) return { label: "Warning", tone: "bg-amber-100 text-amber-700" };
  return { label: "On Track", tone: "bg-emerald-100 text-emerald-700" };
}

export function BudgetsWorkspace() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, loading, error, refetch } = useBudgetsData();
  const { pushToast } = useToast();

  const totals = useMemo(() => {
    const totalBudget = data.budgets.reduce((sum, item) => sum + item.limitAmount, 0);
    const totalSpent = data.budgets.reduce((sum, item) => sum + item.spent, 0);
    return {
      totalBudget,
      totalSpent,
      remaining: Math.max(totalBudget - totalSpent, 0)
    };
  }, [data.budgets]);

  async function handleSaveBudget(form) {
    await createBudget({
      categoryId: form.categoryId,
      month: form.month,
      limitAmount: Number(form.limitAmount),
      alertThreshold: Number(form.alertThreshold)
    });
    emitDataChanged({ type: "budget-created" });
    pushToast({ title: "Saved", message: "Budget created with alert threshold." });
    setModalOpen(false);
    await refetch();
  }

  async function handleDeleteBudget(item) {
    const confirmed = window.confirm(`Delete budget "${item.name}"?`);
    if (!confirmed) return;
    await deleteBudget(item._id);
    emitDataChanged({ type: "budget-deleted" });
    pushToast({ title: "Deleted", message: "Budget removed successfully." });
    await refetch();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Budgets</h1>
          <p className="mt-1 text-sm text-stone-500">Track your spending limits</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-[#a9682b] px-4 py-2.5 text-sm font-semibold text-white"
        >
          + Add Budget
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[18px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
          <p className="text-sm text-stone-500">Total Budget</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{formatCurrency(totals.totalBudget)}</p>
        </div>
        <div className="rounded-[18px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
          <p className="text-sm text-stone-500">Total Spent</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{formatCurrency(totals.totalSpent)}</p>
        </div>
        <div className="rounded-[18px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
          <p className="text-sm text-stone-500">Remaining</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{formatCurrency(totals.remaining)}</p>
        </div>
      </section>

      <section className="space-y-4">
        {data.budgets.length ? (
          data.budgets.map((budget) => {
            const status = getBudgetStatus(budget.percentUsed);
            return (
              <article
                key={budget._id}
                className="rounded-[18px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_16px_40px_rgba(83,67,51,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900">{budget.name}</h3>
                    <p className="text-sm text-stone-500">{budget.monthly || budget.month}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.tone}`}>
                      {status.label}
                    </span>
                    <button
                      onClick={() => handleDeleteBudget(budget)}
                      className="rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 text-lg text-stone-900">
                  <span>{formatCurrency(budget.spent)} spent</span>
                  <span>of {formatCurrency(budget.limitAmount)}</span>
                </div>

                <div className="mt-3 h-3 rounded-full bg-[#e8e2db]">
                  <div
                    className={`h-3 rounded-full ${budget.percentUsed >= 100 ? "bg-rose-500" : budget.percentUsed >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
                  <span>{budget.percentUsed}% used</span>
                  <span>{formatCurrency(budget.remaining)} left</span>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[20px] border border-dashed border-stone-300 bg-[#faf7f3] p-8 text-center text-lg text-stone-500">
            No budgets yet. Create a budget to track category spending live.
          </div>
        )}
      </section>

      <BudgetFormModal
        open={modalOpen}
        categories={data.categories}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
