import { formatCurrency, formatDate } from "../../lib/formatters";
import { AppIcon, getCategoryIconName, WalletTypeIcon } from "../ui/AppIcon";

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-[#f5f2ef] px-3 py-2 text-xs font-medium text-[#211a12] transition hover:bg-[#efe9e1]"
    >
      <AppIcon name={icon} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

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
    <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7658]">Recent Transactions</p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">Latest records</h2>
          <p className="mt-1 text-xs text-stone-500">
            Filter by note, amount, category, wallet type, and time range.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton icon="plus" label="Add" onClick={onAddTransaction} />
          <ActionButton icon="import" label="Import" onClick={onImport} />
          <ActionButton icon="export" label="Export" onClick={onExport} />
          <ActionButton icon="refresh" label="Refresh" onClick={onRefresh} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative">
          <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            placeholder="Search note or amount"
            className="w-full rounded-xl border border-stone-200 bg-[#faf7f3] py-2 pl-9 pr-3 text-sm text-stone-800 outline-none"
          />
        </label>

        <select
          value={filters.walletType}
          onChange={(event) => onFilterChange("walletType", event.target.value)}
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
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
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.categoryId}
          onChange={(event) => onFilterChange("categoryId", event.target.value)}
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
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
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
        >
          <option value="all">All time</option>
          <option value="day">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
          <thead>
            <tr className="text-stone-500">
              <th className="border-b border-stone-200 px-3 py-2.5 font-medium">Category</th>
              <th className="border-b border-stone-200 px-3 py-2.5 font-medium">Note</th>
              <th className="border-b border-stone-200 px-3 py-2.5 font-medium">Wallet</th>
              <th className="border-b border-stone-200 px-3 py-2.5 font-medium">Amount</th>
              <th className="border-b border-stone-200 px-3 py-2.5 font-medium">Date</th>
              <th className="border-b border-stone-200 px-3 py-2.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="text-stone-800">
                  <td className="border-b border-stone-100 px-3 py-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#efe7dc] px-2.5 py-1 text-[11px] font-semibold text-[#7a664a]">
                      <AppIcon name={getCategoryIconName(transaction.category?.icon)} className="h-3.5 w-3.5" />
                      {transaction.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3">
                    <div className="font-medium text-stone-900">{transaction.note || "No note"}</div>
                    {transaction.description ? (
                      <div className="mt-0.5 text-[11px] text-stone-500">{transaction.description}</div>
                    ) : null}
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3">
                    <div className="flex items-center gap-2 font-medium text-stone-900">
                      <WalletTypeIcon type={transaction.wallet?.type} className="h-3.5 w-3.5" />
                      <span>{transaction.wallet?.name || "No wallet"}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-stone-500">
                      {transaction.wallet?.type || "unknown"}
                    </div>
                  </td>
                  <td
                    className={`border-b border-stone-100 px-3 py-3 text-sm font-bold ${
                      transaction.type === "income" ? "text-rose-500" : "text-emerald-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3 text-stone-500">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(transaction)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-700"
                      >
                        <AppIcon name="edit" className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(transaction)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-rose-600"
                      >
                        <AppIcon name="delete" className="h-3.5 w-3.5" />
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
