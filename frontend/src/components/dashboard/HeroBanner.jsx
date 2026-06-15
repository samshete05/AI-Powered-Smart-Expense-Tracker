import { AppIcon } from "../ui/AppIcon";

export function HeroBanner() {
  return (
    <section className="rounded-[22px] border border-stone-200 bg-[linear-gradient(135deg,#fdfcfc,#f4f1ed)] p-4 shadow-[0_20px_50px_rgba(83,67,51,0.08)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7658]">Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-stone-900 sm:text-[28px]">
            Keep spending, budgets, imports, and reminders in one place.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
            Review your daily money flow, track wallets, and catch recurring payments before they hit.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-[320px] lg:grid-cols-1">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-[#a9682b] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-105">
            <AppIcon name="plus" className="h-4 w-4" />
            Add transaction
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-[#f5f2ef] px-3 py-2.5 text-sm font-medium text-[#211a12] transition hover:bg-[#efe9e1]">
            <AppIcon name="import" className="h-4 w-4" />
            Import statement
          </button>
          <div className="rounded-xl border border-stone-200 bg-[#faf7f3] p-3 sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold text-stone-900">Finance assistant</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Ready with category rules, OCR review, and safe-to-spend guidance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
