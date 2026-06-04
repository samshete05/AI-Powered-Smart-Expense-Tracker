import { formatCurrency, formatDate } from "../../lib/formatters";

export function TransactionsTableCard({
  transactions,
  filters,
  categories,
  walletTypes,
  onFilterChange,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onExport,
  onImport,
  onRefresh
}) {
  return (
    <section className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Recent Transactions</p>
          <h2 className="mt-2 text-[26px] font-bold text-stone-900">User transaction history</h2>
          <p className="mt-2 text-sm text-stone-500">
            Every new transaction is saved to the current user and appears here with live filters.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={onAddTransaction} className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]">
            Add transaction
          </button>
          <button onClick={onImport} className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]">
            Import
          </button>
          <button onClick={onExport} className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]">
            Export
          </button>
          <button onClick={onRefresh} className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]">
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={filters.search}
          onChange={(event) => onFilterChange("search", event.target.value)}
          placeholder="Search note or amount"
          className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        />

        <select
          value={filters.walletType}
          onChange={(event) => onFilterChange("walletType", event.target.value)}
          className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        >
          <option value="all">All wallet types</option>
          {walletTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(event) => onFilterChange("type", event.target.value)}
          className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.categoryId}
          onChange={(event) => onFilterChange("categoryId", event.target.value)}
          className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.range}
          onChange={(event) => onFilterChange("range", event.target.value)}
          className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        >
          <option value="all">All time</option>
          <option value="day">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-stone-500">
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Category</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Note</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Wallet</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Amount</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Date</th>
              <th className="border-b border-stone-200 px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="text-stone-800">
                  <td className="border-b border-stone-100 px-4 py-4">
                    <span className="rounded-full bg-[#efe7dc] px-3 py-1 text-xs font-semibold text-[#7a664a]">
                      {transaction.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="border-b border-stone-100 px-4 py-4">
                    <div className="font-medium text-stone-900">
                      {transaction.note || "No note"}
                    </div>
                    {transaction.description ? (
                      <div className="mt-1 text-xs text-stone-500">{transaction.description}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-stone-100 px-4 py-4">
                    <div className="font-medium text-stone-900">
                      {transaction.wallet?.name || "No wallet"}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                      {transaction.wallet?.type || "unknown"}
                    </div>
                  </td>
                  <td
                    className={`border-b border-stone-100 px-4 py-4 text-base font-bold ${
                      transaction.type === "income" ? "text-rose-500" : "text-emerald-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="border-b border-stone-100 px-4 py-4 text-stone-500">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="border-b border-stone-100 px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditTransaction(transaction)}
                        className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(transaction)}
                        className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-sm text-stone-500">
                  No transactions found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
