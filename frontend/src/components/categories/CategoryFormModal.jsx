import { useEffect, useState } from "react";
import { AppIcon, categoryIconNames, getCategoryIconName } from "../ui/AppIcon";

const colors = [
  "#10b981", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#ef4444", "#6366f1", "#14b8a6",
  "#f97316", "#84cc16", "#06b6d4", "#a855f7",
  "#c026d3", "#22c55e", "#eab308", "#78716c"
];

const initialForm = {
  name: "",
  type: "expense",
  color: "#10b981",
  icon: "shopping"
};

export function CategoryFormModal({ open, category, onClose, onSave, saving }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    if (category) {
      setForm({
        name: category.name || "",
        type: category.type || "expense",
        color: category.color || "#10b981",
        icon: category.icon || "shopping"
      });
    } else {
      setForm(initialForm);
    }
  }, [category, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-950/20 p-3 backdrop-blur-sm">
      <div className="h-full w-full max-w-[520px] rounded-[24px] border border-stone-200 bg-[#fdfcfc] p-5 shadow-[0_30px_80px_rgba(83,67,51,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundColor: form.color }}>
              <AppIcon name={getCategoryIconName(form.icon)} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">{category ? "Edit category" : "Add category"}</h2>
              <p className="mt-1 text-sm text-stone-500">Create a new category</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">Close</button>
        </div>

        <div className="mt-6">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Category name"
            className="w-full rounded-xl border border-[#d9c7b3] bg-transparent px-4 py-3 text-base text-stone-800 outline-none"
          />
        </div>

        <div className="mt-5 flex items-center gap-6 text-sm text-stone-700">
          <label className="flex items-center gap-2">
            <input type="radio" checked={form.type === "expense"} onChange={() => setForm((current) => ({ ...current, type: "expense" }))} />
            Expense
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={form.type === "income"} onChange={() => setForm((current) => ({ ...current, type: "income" }))} />
            Income
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-stone-900">Color</p>
          <div className="mt-3 grid grid-cols-8 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setForm((current) => ({ ...current, color }))}
                className={`h-9 w-9 rounded-full border-2 ${form.color === color ? "border-[#a9682b]" : "border-transparent"}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-stone-900">Icon</p>
          <div className="mt-3 grid grid-cols-5 gap-3 sm:grid-cols-6">
            {categoryIconNames.map((icon) => (
              <button
                key={icon}
                onClick={() => setForm((current) => ({ ...current, icon }))}
                className={`grid h-10 w-10 place-items-center rounded-2xl ${
                  form.icon === icon ? "bg-[#f1e7db] text-stone-900" : "bg-[#faf7f3] text-stone-500"
                }`}
              >
                <AppIcon name={icon} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-stone-200 pt-5">
          <button onClick={onClose} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="rounded-xl bg-[#a9682b] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : category ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
