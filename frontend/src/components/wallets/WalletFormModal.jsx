import { useEffect, useState } from "react";
import { WalletTypeIcon } from "../ui/AppIcon";

const walletTypes = [
  { value: "bank", label: "Bank" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "savings", label: "Savings" },
  { value: "investment", label: "Investment" }
];

function buildInitialForm(defaultCurrency = "INR") {
  return {
    name: "",
    balance: "",
    type: "bank",
    currency: defaultCurrency || "INR",
    color: "#b89f7a"
  };
}

export function WalletFormModal({ open, wallet, onClose, onSave, saving, defaultCurrency = "INR" }) {
  const [form, setForm] = useState(buildInitialForm(defaultCurrency));

  useEffect(() => {
    if (!open) return;
    if (wallet) {
      setForm({
        name: wallet.name || "",
        balance: wallet.balance || "",
        type: wallet.type || "bank",
        currency: wallet.currency || "INR",
        color: wallet.color || "#b89f7a"
      });
    } else {
      setForm(buildInitialForm(defaultCurrency));
    }
  }, [defaultCurrency, open, wallet]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-5 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">{wallet ? "Edit wallet" : "Add wallet"}</h2>
            <p className="mt-1 text-sm text-stone-500">Choose wallet type and current balance.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Wallet name"
            className="w-full rounded-xl border border-[#d9c7b3] bg-transparent px-4 py-3 text-base text-stone-800 outline-none"
          />

          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.balance}
              onChange={(event) => setForm((current) => ({ ...current, balance: event.target.value }))}
              placeholder="Current balance"
              className="w-full rounded-xl border border-stone-200 bg-[#faf7f3] px-4 py-3 text-sm text-stone-800 outline-none"
            />
            <select
              value={form.currency}
              onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
              className="w-full rounded-xl border border-stone-200 bg-[#faf7f3] px-4 py-3 text-sm text-stone-800 outline-none"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-stone-900">Wallet type</p>
            <div className="grid gap-3 md:grid-cols-3">
              {walletTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type: type.value }))}
                  className={`flex items-center gap-2 rounded-[16px] border px-4 py-3 text-left text-sm transition ${
                    form.type === type.value
                      ? "border-[#20b983] bg-[#effaf4] text-stone-900"
                      : "border-stone-200 text-stone-700"
                  }`}
                >
                  <WalletTypeIcon type={type.value} className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={saving}
              className="rounded-xl bg-[#a9682b] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : wallet ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
