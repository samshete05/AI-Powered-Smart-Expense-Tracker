import { useMemo, useState } from "react";
import { useGoalsData } from "../../hooks/useGoalsData";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { AppIcon } from "../ui/AppIcon";
import { useToast } from "../ui/ToastProvider";

function GoalCard({ goal, onAddSavings, onDelete }) {
  const [contribution, setContribution] = useState("");
  const safeProgress = Math.min(goal.progressPercent || 0, 100);

  return (
    <article className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f4efe7] text-[#a9682b]">
              <AppIcon name="goal" className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-stone-900">{goal.name}</h3>
              <p className="text-xs text-stone-500">
                Target {formatCurrency(goal.targetAmount)}{goal.targetDate ? ` by ${formatDate(goal.targetDate)}` : ""}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600"
        >
          <AppIcon name="delete" className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#8a7658]">Saved</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{formatCurrency(goal.currentAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8a7658]">Remaining</p>
            <p className="mt-1 text-lg font-semibold text-stone-700">
              {formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))}
            </p>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#ece6de]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#a9682b,#df9759)] transition-[width]"
            style={{ width: `${safeProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>{safeProgress}% complete</span>
          <span className="capitalize">{goal.status}</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            type="number"
            min="0"
            step="0.01"
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            placeholder="Add savings amount"
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const amount = Number(contribution);
              if (amount > 0) {
                onAddSavings(amount);
                setContribution("");
              }
            }}
            className="rounded-xl bg-[#a9682b] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Save money
          </button>
        </div>
      </div>
    </article>
  );
}

export function GoalsWorkspace() {
  const { data, loading, error, refetch, saveGoal, editGoal, removeGoal } = useGoalsData();
  const { pushToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: ""
  });
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, goal) => {
        acc.target += Number(goal.targetAmount || 0);
        acc.saved += Number(goal.currentAmount || 0);
        return acc;
      },
      { target: 0, saved: 0 }
    );
  }, [data]);

  async function handleCreateGoal() {
    if (busy) return;
    setBusy(true);

    try {
      await saveGoal({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        targetDate: form.targetDate || undefined,
        status: "active"
      });
      pushToast({ title: "Saved", message: "Goal created successfully." });
      setForm({
        name: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: ""
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleAddSavings(goal, amount) {
    await editGoal(goal._id, {
      currentAmount: Number(goal.currentAmount || 0) + amount,
      status: Number(goal.currentAmount || 0) + amount >= Number(goal.targetAmount || 0) ? "completed" : goal.status
    });
    pushToast({ title: "Saved", message: "Goal savings updated." });
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7658]">Goals</p>
          <h2 className="mt-2 text-xl font-bold text-stone-900">Save for the things you care about</h2>
          <p className="mt-1 text-sm text-stone-500">
            Add goals like a car, piano, trip, emergency fund, or anything else and keep contributing over time.
          </p>

          <div className="mt-4 grid gap-3">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Goal name"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.targetAmount}
              onChange={(event) => setForm((current) => ({ ...current, targetAmount: event.target.value }))}
              placeholder="Target amount"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.currentAmount}
              onChange={(event) => setForm((current) => ({ ...current, currentAmount: event.target.value }))}
              placeholder="Already saved"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
            <input
              type="date"
              value={form.targetDate}
              onChange={(event) => setForm((current) => ({ ...current, targetDate: event.target.value }))}
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
            <button
              type="button"
              onClick={handleCreateGoal}
              disabled={busy || !form.name.trim() || Number(form.targetAmount) <= 0}
              className="rounded-xl bg-[#a9682b] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving..." : "Create goal"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
            <p className="text-xs text-stone-500">Active goals</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{data.length}</p>
          </div>
          <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
            <p className="text-xs text-stone-500">Target total</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{formatCurrency(totals.target)}</p>
          </div>
          <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
            <p className="text-xs text-stone-500">Saved so far</p>
            <p className="mt-2 text-3xl font-bold text-stone-900">{formatCurrency(totals.saved)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {data.length ? (
          data.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onAddSavings={(amount) => handleAddSavings(goal, amount)}
              onDelete={async () => {
                await removeGoal(goal._id);
                pushToast({ title: "Deleted", message: "Goal removed successfully." });
              }}
            />
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-stone-300 bg-[#faf7f3] p-6 text-sm text-stone-500 xl:col-span-2">
            No goals yet. Start with something concrete like a car, bike, piano, laptop, vacation, or emergency fund.
          </div>
        )}
      </section>
    </div>
  );
}
