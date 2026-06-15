import { formatCurrency, formatDate } from "../../lib/formatters";

export function TransactionsCard({ transactions }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7658]">Transactions</p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">Recent activity</h2>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex min-w-[250px] items-center gap-3 rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input className="h-7 w-full bg-transparent text-xs font-medium text-[#211a12] placeholder:text-stone-400 outline-none" placeholder="Search transactions" />
          </label>
          <button className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12] transition-all duration-150">
            This month
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
          <thead>
            <tr className="text-stone-500">
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Category</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Note</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Wallet</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Date</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="text-stone-800">
                <td className="border-b border-stone-100 px-3 py-3">
                  <span className="rounded-full bg-[#efe7dc] px-2.5 py-1 text-[11px] font-semibold text-[#7a664a]">
                    {transaction.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="border-b border-stone-100 px-3 py-3">{transaction.note || transaction.merchant || "No note"}</td>
                <td className="border-b border-stone-100 px-3 py-3 text-stone-500">{transaction.wallet?.name || "No wallet"}</td>
                <td className="border-b border-stone-100 px-3 py-3 text-stone-500">{formatDate(transaction.transactionDate)}</td>
                <td className={`border-b border-stone-100 px-3 py-3 font-bold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
