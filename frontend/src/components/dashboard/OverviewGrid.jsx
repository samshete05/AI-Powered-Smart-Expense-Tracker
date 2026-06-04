import { formatCurrency } from "../../lib/formatters";

export function OverviewGrid({ summary }) {
  const cards = [
    { label: "Net balance", value: summary.balance, note: "Income minus monthly spend", accent: "from-[#fdfcfc] to-[#efe8df]" },
    { label: "Income", value: summary.income, note: "Current month credited amount", accent: "from-[#fcfbf9] to-[#ece6df]" },
    { label: "Expenses", value: summary.expenses, note: "Current month outgoing amount", accent: "from-[#fdfcfc] to-[#efe9e1]" },
    { label: "Safe to spend", value: summary.safeToSpend, note: "Daily guardrail after budgets", accent: "from-[#fcfbfa] to-[#ece7e0]", suffix: "/day" }
  ];

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-[28px] border border-stone-200 bg-linear-to-br ${card.accent} from-0% to-100% p-5 text-stone-800 shadow-[0_20px_50px_rgba(83,67,51,0.08)] backdrop-blur-xl`}
        >
          <p className="text-sm text-stone-500">{card.label}</p>
          <p className="mt-4 text-3xl font-black">
            {formatCurrency(card.value)}
            {card.suffix || ""}
          </p>
          <p className="mt-3 text-sm text-stone-600">{card.note}</p>
        </article>
      ))}
    </section>
  );
}
