export function Sidebar({ items, activeItem, onSelect }) {
  return (
    <aside className="border-b border-stone-300/70 bg-[#fdfcfc]/90 p-5 backdrop-blur-2xl xl:border-r xl:border-b-0 xl:p-7">
      <div className="flex items-center gap-4">
        <div className="grid h-9 w-14 place-items-center rounded-xl bg-linear-to-br from-[#d4c4af] to-[#b89f7a] text-lg font-black text-stone-900 shadow-[0_20px_40px_rgba(184,159,122,0.28)]">
          AI
        </div>
        <div>
          <p className="text-[17px] font-bold">AI Powered Expense Tracker</p>

        </div>
      </div>

      <nav className="mt-8 grid gap-3">
        {items.map((item, index) => (
          <button
            key={item}
            onClick={() => onSelect?.(item)}
            className={`rounded-md px-3 py-1.5 text-left text-xs font-medium leading-4 transition-all duration-150 ${
              activeItem ? activeItem === item : index === 0
                ? "bg-[#ece6de] text-stone-900 ring-1 ring-[#d4c4af]"
                : "bg-[#f6f3ef] text-stone-600 hover:bg-[#efebe6]"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-[#f7f4f1] p-5 shadow-[0_18px_50px_rgba(83,67,51,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a7658]">AI Coach</p>
        <h2 className="mt-3 text-lg font-semibold">Watch recurring payments this week</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          We detected repeat merchant charges that look like subscriptions. Review them before your next billing cycle.
        </p>
        <button className="mt-4 rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]">
          Review leaks
        </button>
      </div>
    </aside>
  );
}
