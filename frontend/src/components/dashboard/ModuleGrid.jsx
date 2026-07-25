export function ModuleGrid({ modules }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7658]">Modules</p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">Core tracking tools</h2>
        </div>
        <div className="inline-flex rounded-xl border border-stone-200 bg-[#f6f2ed] p-1 text-[11px]">
          <button className="rounded-md bg-[#fdfcfc] px-3 py-1.5 font-medium text-[#211a12]">Overview</button>
          <button className="rounded-md px-3 py-1.5 font-medium text-stone-500">Operations</button>
          <button className="rounded-md px-3 py-1.5 font-medium text-stone-500">Insights</button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {modules.map((item) => (
          <article key={item.title} className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
              <span className="rounded-full bg-[#ede6dc] px-2.5 py-1 text-[11px] font-semibold text-[#7b694f]">
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
