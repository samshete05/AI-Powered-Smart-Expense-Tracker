import { AppIcon } from "./AppIcon";

const plans = [
  {
    name: "Starter Pro",
    price: "Rs 199 / month",
    accent: "bg-[#f7eee4] text-[#a9682b]",
    icon: "wallet",
    features: ["Unlimited SMS parsing", "Receipt OCR review", "Email invoice import"]
  },
  {
    name: "Growth Pro",
    price: "Rs 499 / month",
    accent: "bg-[#f2eadf] text-[#855625]",
    icon: "analytics",
    features: ["Advanced analytics refresh", "Goal tracking insights", "Priority category suggestions"]
  },
  {
    name: "Business Pro",
    price: "Rs 999 / month",
    accent: "bg-[#efe3d5] text-[#6d4319]",
    icon: "trend",
    features: ["Team expense workflows", "Invoice-heavy automations", "Premium support and exports"]
  }
];

export function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl rounded-[28px] border border-stone-200 bg-[#fdfcfc] p-5 shadow-[0_35px_80px_rgba(34,24,14,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7658]">Upgrade to Pro</p>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">Choose the subscription that fits your workflow</h2>
            <p className="mt-1 text-sm text-stone-500">Three plans, clear pricing, and better automation coverage for the tracker.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-600"
          >
            <AppIcon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <section key={plan.name} className="rounded-[24px] border border-stone-200 bg-[#faf7f3] p-5">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${plan.accent}`}>
                <AppIcon name={plan.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-stone-900">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-[#a9682b]">{plan.price}</p>
              <div className="mt-4 space-y-2 text-sm text-stone-600">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#a9682b]">
                      <AppIcon name="target" className="h-3 w-3" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-5 w-full rounded-2xl bg-[#a9682b] px-4 py-3 text-sm font-semibold text-white"
              >
                Select plan
              </button>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
