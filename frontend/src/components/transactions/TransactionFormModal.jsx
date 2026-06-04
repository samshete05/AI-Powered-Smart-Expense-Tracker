import { useEffect, useMemo, useState } from "react";

const initialForm = {
  type: "expense",
  amount: "",
  note: "",
  walletId: "",
  categoryId: "",
  merchant: "",
  description: "",
  transactionDate: new Date().toISOString().slice(0, 10),
  newCategoryName: ""
};

export function TransactionFormModal({
  open,
  transaction,
  wallets,
  categories,
  onClose,
  onSave,
  onOpenWalletModal
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!transaction) {
      setForm(initialForm);
      return;
    }

    setForm({
      type: transaction.type || "expense",
      amount: transaction.amount || "",
      note: transaction.note || "",
      walletId: transaction.wallet?._id || "",
      categoryId: transaction.category?._id || "",
      merchant: transaction.merchant || "",
      description: transaction.description || "",
      transactionDate: transaction.transactionDate ? transaction.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      newCategoryName: ""
    });
  }, [transaction]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-6 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">
              {transaction ? "Edit transaction" : "Add transaction"}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-stone-900">
              {transaction ? "Update user transaction" : "Create a new transaction"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <select
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value, categoryId: "" }))}
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            placeholder="Amount"
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />

          <input
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="Note"
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />

          <input
            value={form.merchant}
            onChange={(event) => setForm((current) => ({ ...current, merchant: event.target.value }))}
            placeholder="Merchant"
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />

          <div className="grid gap-2">
            <select
              value={form.walletId}
              onChange={(event) => setForm((current) => ({ ...current, walletId: event.target.value }))}
              className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
            >
              <option value="">Select wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name} ({wallet.type})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenWalletModal}
              type="button"
              className="w-fit rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
            >
              Add new wallet
            </button>
          </div>

          <div className="grid gap-2">
            <select
              value={form.categoryId}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
            >
              <option value="">Select category</option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              value={form.newCategoryName}
              onChange={(event) => setForm((current) => ({ ...current, newCategoryName: event.target.value }))}
              placeholder="Or create custom category"
              className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none"
            />
          </div>

          <input
            type="date"
            value={form.transactionDate}
            onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))}
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />

          <textarea
            rows="3"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Description"
            className="md:col-span-2 rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]"
          >
            {transaction ? "Save changes" : "Create transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
