import { formatCurrency } from "../../lib/formatters";

export function BudgetsCard({ budgets }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)] backdrop-blur-xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7658]">Budgets</p>
      <h2 className="mt-1 text-lg font-bold text-stone-900">Spent vs remaining</h2>
      <div className="mt-4 space-y-4">
        {budgets.map((item) => {
          const percent = Math.min(item.percentUsed || 0, 100);
          const tone = percent >= 100 ? "bg-rose-400" : percent >= 80 ? "bg-amber-400" : "bg-emerald-400";

          return (
            <div key={item._id}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span>{item.name}</span>
                <span className="text-stone-500">
                  {formatCurrency(item.spent)} / {formatCurrency(item.limitAmount)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#ece6de]">
                <div className={`h-2.5 rounded-full ${tone}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
