import { formatCurrency } from "../../lib/formatters";

const chartRanges = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" }
];

export function TransactionChartCard({ analytics, range, onRangeChange }) {
  const chartData = analytics?.chart || [];
  const maxValue = Math.max(
    ...chartData.flatMap((item) => [item.income || 0, item.expense || 0]),
    1
  );

  return (
    <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7658]">
            Transactions Overview
          </p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">
            Cashflow chart
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Track income and expense movement across day, week, month, and year views.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-2">
          {chartRanges.map((option) => (
            <button
              key={option.value}
              onClick={() => onRangeChange(option.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                range === option.value
                  ? "border border-[#fdfcfc] bg-[#f5f2ef] text-[#211a12]"
                  : "border border-stone-200 bg-white text-stone-500 hover:bg-[#f5f2ef]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Income</p>
          <p className="mt-1 text-xl font-bold text-rose-500">
            +{formatCurrency(analytics?.totals?.income || 0)}
          </p>
        </div>
        <div className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Expense</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            -{formatCurrency(analytics?.totals?.expense || 0)}
          </p>
        </div>
        <div className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Entries</p>
          <p className="mt-1 text-xl font-bold text-stone-900">
            {analytics?.count || 0}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3">
        {chartData.length ? (
          <div className="flex h-[220px] items-end gap-2 overflow-x-auto pb-3">
            {chartData.map((item) => (
              <div key={item.key} className="flex min-w-[60px] flex-1 flex-col items-center gap-2">
                <div className="flex h-[170px] w-full items-end justify-center gap-2">
                  <div className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-md bg-rose-400"
                      style={{ height: `${Math.max((item.income / maxValue) * 145, item.income ? 8 : 0)}px` }}
                    />
                    <span className="text-[11px] font-medium text-rose-500">
                      {item.income ? formatCurrency(item.income) : ""}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-md bg-emerald-500"
                      style={{ height: `${Math.max((item.expense / maxValue) * 145, item.expense ? 8 : 0)}px` }}
                    />
                    <span className="text-[11px] font-medium text-emerald-600">
                      {item.expense ? formatCurrency(item.expense) : ""}
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs font-medium text-stone-600">{item.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-[220px] place-items-center text-center text-sm text-stone-500">
            No transaction data available for this range yet.
          </div>
        )}
      </div>
    </section>
  );
}
