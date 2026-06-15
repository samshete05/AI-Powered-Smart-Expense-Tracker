import { useEffect, useState } from "react";

const initialForm = {
  fromWalletId: "",
  toWalletId: "",
  amount: "",
  note: ""
};

export function TransferModal({ open, wallets, onClose, onSave, saving }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) setForm(initialForm);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-5 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Transfer between wallets</h2>
            <p className="mt-1 text-sm text-stone-500">Move money safely between your accounts.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-900">From wallet</span>
            <select
              value={form.fromWalletId}
              onChange={(event) => setForm((current) => ({ ...current, fromWalletId: event.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
            >
              <option value="">Select source wallet...</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-900">To wallet</span>
            <select
              value={form.toWalletId}
              onChange={(event) => setForm((current) => ({ ...current, toWalletId: event.target.value }))}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
            >
              <option value="">Select destination wallet...</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-900">Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="0.00"
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-900">Note (optional)</span>
            <input
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="Add a note..."
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-stone-900">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="rounded-xl bg-[#d0b293] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
