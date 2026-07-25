import { useMemo, useState } from "react";
import { createRecurringExpense, deleteRecurringExpense } from "../../services/api";
import { emitDataChanged } from "../../lib/dataEvents";
import { formatCurrency } from "../../lib/formatters";
import { useRecurringData } from "../../hooks/useRecurringData";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { RecurringDrawer } from "./RecurringDrawer";
import { useToast } from "../ui/ToastProvider";

const groupMeta = {
  subscriptions: { title: "Subs", empty: "No subscriptions yet", dot: "bg-violet-500" },
  bills: { title: "Bills", empty: "No bills yet", dot: "bg-emerald-500" },
  emis: { title: "EMIs", empty: "No EMIs yet", dot: "bg-amber-500" },
  other: { title: "Other", empty: "No other expenses", dot: "bg-stone-500" }
};

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short"
  }).format(new Date(value));
}

function getDaysAway(value) {
  const target = new Date(value);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (diff <= 0) return "Today";
  return `In ${diff}d`;
}

export function RecurringWorkspace() {
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().slice(0, 10));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [defaultType, setDefaultType] = useState("subscriptions");
  const { data, loading, error, refetch } = useRecurringData(referenceDate);
  const { pushToast } = useToast();

  const grouped = useMemo(() => {
    const map = Object.fromEntries(
      Object.keys(groupMeta).map((key) => [key, { ...groupMeta[key], items: [], total: 0 }])
    );

    (data.groups || []).forEach((group) => {
      map[group.type] = {
        ...groupMeta[group.type],
        items: group.items || [],
        total: group.total || 0
      };
    });

    return map;
  }, [data.groups]);

  async function handleSave(form) {
    await createRecurringExpense(form);
    emitDataChanged({ type: "recurring-created" });
    pushToast({ title: "Saved", message: "Recurring payment scheduled successfully." });
    setDrawerOpen(false);
    await refetch();
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Delete recurring expense "${item.name}"?`);
    if (!confirmed) return;
    await deleteRecurringExpense(item._id);
    emitDataChanged({ type: "recurring-deleted" });
    pushToast({ title: "Deleted", message: "Recurring payment removed successfully." });
    await refetch();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Recurring</h1>
          <p className="mt-1 text-sm text-stone-500">Subscriptions, Bills & EMIs</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={referenceDate.slice(0, 7)}
            onChange={(event) => setReferenceDate(`${event.target.value}-01`)}
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none"
          />
          <button
            onClick={() => {
              setDefaultType("subscriptions");
              setDrawerOpen(true);
            }}
            className="rounded-full bg-[#a9682b] px-4 py-2.5 text-sm font-semibold text-white"
          >
            + Add
          </button>
        </div>
      </section>

      <section className="grid gap-4 rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-5 shadow-[0_18px_50px_rgba(83,67,51,0.08)] md:grid-cols-2 xl:grid-cols-4">
        <div className="border-r border-stone-200 pr-4 xl:pr-8">
          <p className="text-sm uppercase tracking-[0.18em] text-[#8a7658]">Monthly</p>
          <p className="mt-2 text-4xl font-bold text-stone-900">{formatCurrency(data.summary.monthlyTotal)}</p>
          <p className="mt-2 text-base text-stone-500">{data.summary.monthlyCount} active</p>
        </div>
        <div className="border-r border-stone-200 pr-4 xl:pr-8">
          <p className="text-sm uppercase tracking-[0.18em] text-[#8a7658]">Quarterly</p>
          <p className="mt-2 text-4xl font-bold text-stone-900">{formatCurrency(data.summary.quarterlyTotal)}</p>
          <p className="mt-2 text-base text-stone-500">{data.summary.quarterlyCount} expense</p>
        </div>
        <div className="border-r border-stone-200 pr-4 xl:pr-8">
          <p className="text-sm uppercase tracking-[0.18em] text-[#8a7658]">Yearly</p>
          <p className="mt-2 text-4xl font-bold text-stone-900">{formatCurrency(data.summary.yearlyTotal)}</p>
          <p className="mt-2 text-base text-stone-500">{data.summary.yearlyCount} expenses</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#8a7658]">Yearly Forecast</p>
          <p className="mt-2 text-4xl font-bold text-stone-900">{formatCurrency(data.summary.yearlyForecast)}</p>
          <p className="mt-2 text-base text-stone-500">all recurrences</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-5 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
          <p className="text-sm uppercase tracking-[0.16em] text-stone-500">Selected Month Income</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{formatCurrency(data.summary.monthIncome)}</p>
        </div>
        <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-5 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
          <p className="text-sm uppercase tracking-[0.16em] text-stone-500">Expenses + Recurring</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">
            {formatCurrency(data.summary.monthExpense + data.summary.projectedExpense)}
          </p>
        </div>
        <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-5 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
          <p className="text-sm uppercase tracking-[0.16em] text-stone-500">Projected Balance</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{formatCurrency(data.summary.projectedBalance)}</p>
        </div>
      </section>

      <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_50px_rgba(83,67,51,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-stone-900">Upcoming payments</h2>
          <p className="text-sm text-stone-500">View full month</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {data.upcomingPayments.length ? (
            data.upcomingPayments.map((item) => (
              <div key={item._id} className="w-full max-w-[220px] rounded-[18px] border border-stone-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-2xl font-bold text-stone-900">
                      {new Date(item.nextPaymentDate).getDate()}
                    </p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-stone-600">
                      {formatShortDate(item.nextPaymentDate)}
                    </p>
                  </div>
                  <span className="text-sm text-stone-500">{getDaysAway(item.nextPaymentDate)}</span>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium text-stone-500">1 payment</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-stone-900">{item.name}</span>
                    <span className="text-lg font-bold text-stone-900">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-stone-300 bg-[#faf7f3] px-5 py-8 text-sm text-stone-500">
              No upcoming recurring payments for the selected month.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-stone-900">All payments</h2>
          <span className="text-sm text-stone-500">{data.items.length} total</span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          {Object.entries(grouped).map(([key, group]) => (
            <div key={key} className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 shadow-[0_16px_40px_rgba(83,67,51,0.08)]">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${group.dot}`} />
                  <span className="text-[16px] font-semibold text-stone-900">{group.title}</span>
                </div>
                <span className="text-[16px] font-semibold text-stone-900">{formatCurrency(group.total)}</span>
              </div>

              <div className="p-4">
                {group.items.length ? (
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item._id} className="flex items-start justify-between gap-3 rounded-[16px] bg-[#faf7f3] p-3">
                        <div>
                          <p className="text-lg font-semibold text-stone-900">{item.name}</p>
                          <p className="mt-1 text-sm text-stone-500">
                            {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                            {item.nextPaymentDate ? ` · ${getDaysAway(item.nextPaymentDate)}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-stone-900">{formatCurrency(item.amount)}</p>
                          <button
                            onClick={() => handleDelete(item)}
                            className="mt-2 rounded-md border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-7 text-center">
                    <p className="text-lg text-stone-500">{group.empty}</p>
                    <button
                      onClick={() => {
                        setDefaultType(key);
                        setDrawerOpen(true);
                      }}
                      className="mt-5 inline-flex items-center gap-2 text-xl font-medium text-stone-900"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <RecurringDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        defaultType={defaultType}
      />
    </div>
  );
}
