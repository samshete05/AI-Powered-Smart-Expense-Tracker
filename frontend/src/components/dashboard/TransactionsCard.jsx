import { formatCurrency, formatDate } from "../../lib/formatters";

export function TransactionsCard({ transactions }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Transactions</p>
          <h2 className="mt-2 text-[26px] font-bold">Recent activity</h2>
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

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
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
                <td className="border-b border-stone-100 px-4 py-4">
                  <span className="rounded-full bg-[#efe7dc] px-3 py-1 text-xs font-semibold text-[#7a664a]">
                    {transaction.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="border-b border-stone-100 px-4 py-4">{transaction.note || transaction.merchant || "No note"}</td>
                <td className="border-b border-stone-100 px-4 py-4 text-stone-500">{transaction.wallet?.name || "No wallet"}</td>
                <td className="border-b border-stone-100 px-4 py-4 text-stone-500">{formatDate(transaction.transactionDate)}</td>
                <td className={`border-b border-stone-100 px-4 py-4 font-bold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
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
