import { useEffect, useState } from "react";

const initialForm = {
  categoryId: "",
  month: new Date().toISOString().slice(0, 7),
  limitAmount: "",
  alertThreshold: 80
};

export function BudgetFormModal({ open, categories, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-6 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[28px] font-bold text-stone-900">Create Budget</h3>
            <p className="mt-2 text-lg text-stone-500">Set a category budget and track spending against it.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <select
            value={form.categoryId}
            onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-4 py-3 text-base text-stone-800 outline-none"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={form.month}
            onChange={(event) => setForm((current) => ({ ...current, month: event.target.value }))}
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-4 py-3 text-base text-stone-800 outline-none"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.limitAmount}
            onChange={(event) => setForm((current) => ({ ...current, limitAmount: event.target.value }))}
            placeholder="Budget amount"
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-4 py-3 text-base text-stone-800 outline-none"
          />

          <input
            type="number"
            min="1"
            max="100"
            value={form.alertThreshold}
            onChange={(event) => setForm((current) => ({ ...current, alertThreshold: event.target.value }))}
            placeholder="Alert threshold"
            className="rounded-xl border border-stone-200 bg-[#faf7f3] px-4 py-3 text-base text-stone-800 outline-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-base font-medium text-stone-700">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-xl bg-[#a9682b] px-5 py-3 text-base font-semibold text-white"
          >
            Create Budget
          </button>
        </div>
      </div>
    </div>
  );
}
