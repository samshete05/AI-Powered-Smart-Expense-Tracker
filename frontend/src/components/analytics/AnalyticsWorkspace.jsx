import { useMemo, useState } from "react";
import { formatCurrency } from "../../lib/formatters";
import { useAnalyticsData } from "../../hooks/useAnalyticsData";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";

const rangeOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" }
];

const recurringLabels = {
  subscriptions: "Subscriptions",
  bills: "Bills",
  emis: "EMIs",
  other: "Other"
};

function Surface({ children, className = "" }) {
  return <section className={`rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)] ${className}`}>{children}</section>;
}

function DonutChart({ items, valueKey = "amount", colorPalette }) {
  const total = items.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  let currentAngle = 0;
  const segments = items.map((item, index) => {
    const value = item[valueKey] || 0;
    const ratio = total ? value / total : 0;
    const startAngle = currentAngle;
    currentAngle += ratio * 360;
    return {
      ...item,
      color: colorPalette[index % colorPalette.length],
      startAngle,
      endAngle: currentAngle
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="240" height="240" viewBox="0 0 240 240" className="-rotate-90 overflow-visible">
        <circle cx="120" cy="120" r="62" fill="none" stroke="#ece6df" strokeWidth="24" />
        {segments.map((segment) => {
          const circumference = 2 * Math.PI * 62;
          const dash = ((segment.endAngle - segment.startAngle) / 360) * circumference;
          const offset = (segment.startAngle / 360) * circumference;
          return (
            <circle
              key={segment.name}
              cx="120"
              cy="120"
              r="62"
              fill="none"
              stroke={segment.color}
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
            />
          );
        })}
        <circle cx="120" cy="120" r="42" fill="#fffdfb" />
      </svg>
      <div className="-mt-32 text-center">
        <p className="text-2xl font-bold text-stone-900">{formatCurrency(total)}</p>
        <p className="text-xs text-stone-500">Total</p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-stone-600">
        {segments.map((segment) => (
          <div key={segment.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span>{segment.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ items }) {
  const maxValue = Math.max(...items.map((item) => item.amount || 0), 1);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[16px] bg-[#fffdfb] p-3">
        <div className="flex h-[260px] items-end justify-around gap-3 border-b border-stone-200 px-3 pb-3">
          {items.map((item, index) => (
            <div key={item.category} className="flex w-full max-w-[120px] flex-col items-center gap-2">
              <p className="text-[11px] font-semibold text-stone-500">{formatCurrency(item.amount)}</p>
              <div
                className="w-full rounded-t-[10px]"
                style={{
                  height: `${Math.max((item.amount / maxValue) * 180, item.amount ? 12 : 0)}px`,
                  background: index % 2 === 0 ? "linear-gradient(180deg,#ffb03a,#ff8a00)" : "#8a6150"
                }}
              />
              <p className="origin-center rotate-[-34deg] pt-3 text-xs text-stone-600">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
      <DonutChart
        items={items.map((item) => ({ name: item.category, amount: item.amount }))}
        colorPalette={["#ffb647", "#a88c7f", "#e6a65d", "#d59552", "#c6a18d"]}
      />
    </div>
  );
}

function LineChart({ series, yearA, yearB }) {
  const maxValue = Math.max(...series.flatMap((item) => [item[yearA] || 0, item[yearB] || 0]), 1);
  const width = 1000;
  const height = 260;
  const paddingX = 48;
  const paddingY = 22;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const buildPath = (year) =>
    series
      .map((item, index) => {
        const x = paddingX + (index / Math.max(series.length - 1, 1)) * chartWidth;
        const y = paddingY + chartHeight - ((item[year] || 0) / maxValue) * chartHeight;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = paddingY + chartHeight - step * chartHeight;
          return (
            <g key={step}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#ddd2c6" strokeDasharray="6 6" />
              <text x={8} y={y + 4} className="fill-stone-500 text-[11px]">
                {formatCurrency(maxValue * step)}
              </text>
            </g>
          );
        })}

        <path d={buildPath(yearA)} fill="none" stroke="#c9ced6" strokeWidth="2.5" />
        <path d={buildPath(yearB)} fill="none" stroke="#3b82f6" strokeWidth="2.5" />

        {series.map((item, index) => {
          const x = paddingX + (index / Math.max(series.length - 1, 1)) * chartWidth;
          const yA = paddingY + chartHeight - ((item[yearA] || 0) / maxValue) * chartHeight;
          const yB = paddingY + chartHeight - ((item[yearB] || 0) / maxValue) * chartHeight;

          return (
            <g key={item.label}>
              <circle cx={x} cy={yA} r="3.5" fill="#ffffff" stroke="#c9ced6" strokeWidth="2.5" />
              <circle cx={x} cy={yB} r="3.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" />
              <text x={x - 10} y={height - 8} className="fill-stone-500 text-[11px]">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[#c9ced6]" />
          <span>{yearA}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-[#3b82f6]" />
          <span>{yearB}</span>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsWorkspace() {
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState("monthly");
  const [customStart, setCustomStart] = useState(new Date(currentYear, new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().slice(0, 10));
  const [yearA, setYearA] = useState(currentYear - 1);
  const [yearB, setYearB] = useState(currentYear);

  const filters = useMemo(
    () => ({
      range,
      customStart: range === "custom" ? customStart : undefined,
      customEnd: range === "custom" ? customEnd : undefined,
      compareYearA: yearA,
      compareYearB: yearB
    }),
    [customEnd, customStart, range, yearA, yearB]
  );

  const { data, loading, error, refetch } = useAnalyticsData(filters);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <Surface>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">This Month</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{formatCurrency(data.expenseSummary.total)}</p>
            <p className="mt-1 text-base text-stone-500">Total Expenses</p>
          </div>
          <div className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500">0.0%</div>
        </div>
        <div className="mt-4 grid gap-4 border-t border-stone-200 pt-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-stone-500">Categories</p>
            <p className="text-xl font-semibold text-stone-900">{data.expenseSummary.categories}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Daily Avg</p>
            <p className="text-xl font-semibold text-stone-900">{formatCurrency(data.expenseSummary.dailyAverage)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Health</p>
            <p className={`text-xl font-semibold ${data.expenseSummary.health === "Poor" ? "text-rose-500" : "text-emerald-600"}`}>
              {data.expenseSummary.health}
            </p>
          </div>
        </div>
      </Surface>

      <Surface>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Financial health score</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{data.expenseSummary.financialHealth?.score || 0}/100</p>
            <p className="mt-1 text-base text-stone-500">{data.expenseSummary.financialHealth?.label || "Current state"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[16px] bg-[#faf7f3] p-4">
            <p className="text-xs text-stone-500">Spending discipline</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{data.expenseSummary.financialHealth?.drivers?.spendingDiscipline || 0}</p>
          </div>
          <div className="rounded-[16px] bg-[#faf7f3] p-4">
            <p className="text-xs text-stone-500">Savings strength</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{data.expenseSummary.financialHealth?.drivers?.savingsStrength || 0}</p>
          </div>
          <div className="rounded-[16px] bg-[#faf7f3] p-4">
            <p className="text-xs text-stone-500">Recurring pressure</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{data.expenseSummary.financialHealth?.drivers?.recurringCommitment || 0}</p>
          </div>
        </div>
      </Surface>

      <Surface>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-rose-500">Expenses {formatCurrency(data.expenseSummary.total)}</h2>
          </div>
          <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-400">$</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                range === option.value ? "bg-[#a9682b] text-white" : "bg-[#f1ede8] text-stone-800"
              }`}
            >
              {option.label}
            </button>
          ))}
          {range === "custom" ? (
            <div className="flex flex-wrap gap-2">
              <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none" />
              <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none" />
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <BarChart items={data.expenseBreakdown.bars} />
        </div>
      </Surface>

      <Surface>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Monthly Recurring</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{formatCurrency(data.recurringSummary.monthlyRecurring)}</p>
          </div>
          <button onClick={refetch} className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-500">↻</button>
        </div>

        <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          {data.recurringSummary.activeCount} active
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {data.recurringSummary.byType.map((item) => (
            <div key={item.type} className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-4 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-stone-200 bg-white text-base text-stone-500">
                {recurringLabels[item.type].slice(0, 1)}
              </div>
              <p className="mt-4 text-3xl font-bold text-stone-900">{item.count}</p>
              <p className="text-sm text-stone-500">{recurringLabels[item.type]}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <DonutChart
            items={data.recurringSummary.donut.map((item) => ({ name: recurringLabels[item.name], amount: item.count }))}
            valueKey="amount"
            colorPalette={["#7db2f5", "#a88c7f", "#e3a04f", "#7f7f7f"]}
          />
        </div>
      </Surface>

      <Surface>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-stone-500">Year over Year</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900">Spending Comparison</h2>
          </div>
          <div className="flex items-center gap-2">
            <select value={yearA} onChange={(event) => setYearA(Number(event.target.value))} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none">
              {Array.from({ length: 5 }, (_, index) => currentYear - 4 + index).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="text-sm text-stone-400">vs</span>
            <select value={yearB} onChange={(event) => setYearB(Number(event.target.value))} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none">
              {Array.from({ length: 5 }, (_, index) => currentYear - 4 + index).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <LineChart series={data.comparison.series} yearA={data.comparison.yearA} yearB={data.comparison.yearB} />
        </div>
      </Surface>
    </div>
  );
}
