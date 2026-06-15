import { useEffect, useMemo, useState } from "react";
import { AppIcon, getCategoryIconName, WalletTypeIcon } from "../ui/AppIcon";

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

function FieldLabel({ icon, children }) {
  return (
    <span className="mb-1.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
      <AppIcon name={icon} className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export function TransactionFormModal({
  open,
  transaction,
  wallets,
  categories,
  onClose,
  onSave,
  onOpenWalletModal,
  saving
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
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
  }, [open, transaction]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const selectedWallet = wallets.find((wallet) => wallet._id === form.walletId);
  const selectedCategory = filteredCategories.find((category) => category._id === form.categoryId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 p-3 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-2xl rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-4 shadow-[0_30px_80px_rgba(83,67,51,0.18)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7658]">
              {transaction ? "Edit transaction" : "Add transaction"}
            </p>
            <h3 className="mt-1 text-xl font-bold text-stone-900">
              {transaction ? "Update transaction" : "Create a transaction"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <FieldLabel icon="transactions">Type</FieldLabel>
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value, categoryId: "" }))}
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="grid gap-1">
            <FieldLabel icon="wallet">Amount</FieldLabel>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Amount"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
          </label>

          <label className="grid gap-1">
            <FieldLabel icon="message">Note</FieldLabel>
            <input
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="Note"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
          </label>

          <label className="grid gap-1">
            <FieldLabel icon="shopping">Merchant</FieldLabel>
            <input
              value={form.merchant}
              onChange={(event) => setForm((current) => ({ ...current, merchant: event.target.value }))}
              placeholder="Merchant"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
          </label>

          <div className="grid gap-2">
            <label className="grid gap-1">
              <FieldLabel icon="wallet">Wallet</FieldLabel>
              <select
                value={form.walletId}
                onChange={(event) => setForm((current) => ({ ...current, walletId: event.target.value }))}
                className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
              >
                <option value="">Select wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet._id} value={wallet._id}>
                    {wallet.name} ({wallet.type})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between rounded-xl bg-[#f5f2ef] px-3 py-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                {selectedWallet ? <WalletTypeIcon type={selectedWallet.type} className="h-3.5 w-3.5" /> : <AppIcon name="wallet" className="h-3.5 w-3.5" />}
                <span>{selectedWallet ? `${selectedWallet.name} • ${selectedWallet.type}` : "Pick a wallet or create one"}</span>
              </div>
              <button
                type="button"
                onClick={onOpenWalletModal}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-medium text-stone-700"
              >
                New
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="grid gap-1">
              <FieldLabel icon="categories">Category</FieldLabel>
              <select
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
              >
                <option value="">Select category</option>
                {filteredCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-[#f5f2ef] px-3 py-2 text-xs text-stone-600">
              {selectedCategory ? <AppIcon name={getCategoryIconName(selectedCategory.icon)} className="h-3.5 w-3.5" /> : <AppIcon name="categories" className="h-3.5 w-3.5" />}
              <span>{selectedCategory ? selectedCategory.name : "Choose a category or create a custom one"}</span>
            </div>
            <input
              value={form.newCategoryName}
              onChange={(event) => setForm((current) => ({ ...current, newCategoryName: event.target.value }))}
              placeholder="Or create custom category"
              className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
          </div>

          <label className="grid gap-1">
            <FieldLabel icon="analytics">Date</FieldLabel>
            <input
              type="date"
              value={form.transactionDate}
              onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))}
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <FieldLabel icon="message">Description</FieldLabel>
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving}
            className="rounded-xl bg-[#a9682b] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : transaction ? "Save changes" : "Create transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
