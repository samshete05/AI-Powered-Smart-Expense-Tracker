import { useEffect, useState } from "react";
import { WalletTypeIcon } from "../ui/AppIcon";

const walletTypes = ["cash", "upi", "bank", "card", "savings", "investment"];

const initialForm = {
  name: "",
  type: "bank",
  balance: "",
  color: "#b89f7a"
};

export function WalletFormModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-5 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7658]">Wallet</p>
            <h3 className="mt-1 text-xl font-bold text-stone-900">Add a wallet</h3>
          </div>
          <button onClick={onClose} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Wallet name"
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            {walletTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((current) => ({ ...current, type }))}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  form.type === type ? "border-[#a9682b] bg-[#f5eee5] text-stone-900" : "border-stone-200 bg-white text-stone-600"
                }`}
              >
                <WalletTypeIcon type={type} className="h-4 w-4" />
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.balance}
            onChange={(event) => setForm((current) => ({ ...current, balance: event.target.value }))}
            placeholder="Current amount in wallet"
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="rounded-xl bg-[#a9682b] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}
