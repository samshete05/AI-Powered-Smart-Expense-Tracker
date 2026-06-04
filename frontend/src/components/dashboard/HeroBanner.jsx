export function HeroBanner() {
  return (
    <section className="rounded-[24px] border border-stone-200 bg-[linear-gradient(135deg,#fdfcfc,#f4f1ed)] p-6 shadow-[0_30px_80px_rgba(83,67,51,0.10)] md:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Dashboard</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-[44px]">
            AI Powered Expense Tracker with a polished, user-friendly finance workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Monitor cash flow, manage budgets, review OCR and SMS imports, and get actionable financial recommendations from a single premium dashboard.
          </p>
        </div>

        <div className="grid w-full max-w-md gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button className="rounded-md bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12] shadow-none transition-all duration-150">
            Add transaction
          </button>
          <button className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12] transition-all duration-150">
            Import statement
          </button>
          <div className="rounded-xl border border-stone-200 bg-[#faf7f3] p-4 sm:col-span-2 xl:col-span-1">
            <p className="text-[13px] font-semibold">Finance assistant</p>
            <p className="mt-1 text-[13px] text-stone-500">Online now and ready to explain trends, risks, and safe-to-spend guidance.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
