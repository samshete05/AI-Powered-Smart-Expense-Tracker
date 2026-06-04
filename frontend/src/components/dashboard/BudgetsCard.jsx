import { formatCurrency } from "../../lib/formatters";

export function BudgetsCard({ budgets }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)] backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Budgets</p>
      <h2 className="mt-2 text-[26px] font-bold">Spent vs remaining</h2>
      <div className="mt-5 space-y-5">
        {budgets.map((item) => {
          const percent = Math.min(item.percentUsed || 0, 100);
          const tone = percent >= 100 ? "bg-rose-400" : percent >= 80 ? "bg-amber-400" : "bg-emerald-400";

          return (
            <div key={item._id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-stone-500">
                  {formatCurrency(item.spent)} / {formatCurrency(item.limitAmount)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#ece6de]">
                <div className={`h-3 rounded-full ${tone}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
