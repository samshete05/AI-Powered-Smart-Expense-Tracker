import { useEffect, useState } from "react";

const typeOptions = [
  { value: "subscriptions", label: "Subs" },
  { value: "bills", label: "Bills" },
  { value: "emis", label: "EMIs" },
  { value: "other", label: "Other" }
];

const presetMap = {
  subscriptions: ["Netflix", "Spotify", "YouTube", "iCloud"],
  bills: ["Electricity", "Internet", "Water", "Mobile"],
  emis: ["Laptop EMI", "Bike EMI", "Home EMI", "Phone EMI"],
  other: ["Maintenance", "School Fee", "Parking", "Gym"]
};

const initialForm = {
  type: "subscriptions",
  name: "",
  amount: "",
  frequency: "monthly",
  dayOfMonth: new Date().getDate(),
  firstPaymentDate: new Date().toISOString().slice(0, 10),
  notes: ""
};

export function RecurringDrawer({ open, onClose, onSave, defaultType = "subscriptions" }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) {
      setForm((current) => ({
        ...initialForm,
        type: defaultType || "subscriptions"
      }));
    }
  }, [defaultType, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-stone-950/20 backdrop-blur-sm">
      <div className="ml-auto h-full w-full max-w-[680px] overflow-y-auto border-l border-stone-200 bg-[#fdfcfc] shadow-[0_30px_80px_rgba(83,67,51,0.16)]">
        <div className="flex min-h-full flex-col">
          <div className="border-b border-stone-200 px-8 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold text-stone-900">New Recurring Expense</h2>
                <p className="mt-2 text-base text-stone-500">Track a subscription, bill, or EMI</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 px-8 py-8">
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Type <span className="text-rose-500">*</span>
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setForm((current) => ({ ...current, type: option.value }))}
                    className={`rounded-[18px] border px-4 py-5 text-center text-sm font-medium transition-all ${
                      form.type === option.value
                        ? "border-[#d6b7ff] bg-[#f1e6ff] text-[#8b4dff]"
                        : "border-stone-200 bg-[#f3f0ec] text-stone-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {presetMap[form.type].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setForm((current) => ({ ...current, name: preset }))}
                    className="rounded-full bg-[#f1ede8] px-4 py-2 text-sm text-stone-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">
                  Name <span className="text-rose-500">*</span>
                </span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g., Netflix, Spotify"
                  className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 outline-none"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    Amount <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="$ 0.00"
                    className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 outline-none"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    Frequency <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.frequency}
                    onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value }))}
                    className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    Charged on day of month <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.dayOfMonth}
                    onChange={(event) => setForm((current) => ({ ...current, dayOfMonth: Number(event.target.value) }))}
                    className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 outline-none"
                  >
                    {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    First payment date <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={form.firstPaymentDate}
                    onChange={(event) => setForm((current) => ({ ...current, firstPaymentDate: event.target.value }))}
                    className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 outline-none"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-stone-800">More options (optional)</span>
                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Notes or details"
                  className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 outline-none"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-stone-200 px-8 py-5">
            <button
              onClick={onClose}
              className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-base font-medium text-stone-700"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              className="rounded-xl bg-[#d0b293] px-5 py-3 text-base font-semibold text-white"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
