import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  type: "bank",
  balance: "",
  color: "#b89f7a"
};

export function WalletFormModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-6 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Wallet</p>
            <h3 className="mt-2 text-2xl font-bold text-stone-900">Add a new wallet</h3>
          </div>
          <button onClick={onClose} className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Wallet name"
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />

          <select
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
            <option value="card">Card</option>
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.balance}
            onChange={(event) => setForm((current) => ({ ...current, balance: event.target.value }))}
            placeholder="Current amount in wallet"
            className="rounded-md border border-stone-200 bg-[#faf7f3] px-3 py-2 text-sm text-stone-800 outline-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]"
          >
            Save wallet
          </button>
        </div>
      </div>
    </div>
  );
}
