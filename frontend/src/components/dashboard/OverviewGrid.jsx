import { formatCurrency } from "../../lib/formatters";

export function OverviewGrid({ summary }) {
  const cards = [
    { label: "Balance", value: summary.balance, note: "Net cash", accent: "from-[#fdfcfc] to-[#efe8df]" },
    { label: "Income", value: summary.income, note: "This month", accent: "from-[#fcfbf9] to-[#ece6df]" },
    { label: "Expense", value: summary.expenses, note: "This month", accent: "from-[#fdfcfc] to-[#efe9e1]" },
    { label: "Safe / day", value: summary.safeToSpend, note: "Guardrail", accent: "from-[#fcfbfa] to-[#ece7e0]" },
    { label: "Health score", value: summary.financialHealthScore, note: summary.financialHealthLabel || "Current state", accent: "from-[#fffaf3] to-[#efe6d8]", isScore: true }
  ];

  return (
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-[20px] border border-stone-200 bg-linear-to-br ${card.accent} p-4 text-stone-800 shadow-[0_14px_34px_rgba(83,67,51,0.06)]`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{card.label}</p>
          <p className="mt-2 text-xl font-bold text-stone-900 sm:text-2xl">{card.isScore ? `${card.value}/100` : formatCurrency(card.value)}</p>
          <p className="mt-1 text-xs text-stone-500">{card.note}</p>
        </article>
      ))}
    </section>
  );
}
