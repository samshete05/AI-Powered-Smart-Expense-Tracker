export function ModuleGrid({ modules }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Product Modules</p>
          <h2 className="mt-2 text-[26px] font-bold">Core tracking features in the same theme</h2>
        </div>
        <div className="inline-flex rounded-md border border-stone-200 bg-[#f6f2ed] p-1 text-xs">
          <button className="rounded-md bg-[#fdfcfc] px-3 py-1.5 font-medium text-[#211a12]">Overview</button>
          <button className="rounded-md px-3 py-1.5 font-medium text-stone-500">Operations</button>
          <button className="rounded-md px-3 py-1.5 font-medium text-stone-500">Insights</button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {modules.map((item) => (
          <article key={item.title} className="rounded-[18px] border border-stone-200 bg-[#faf7f3] p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <span className="rounded-full bg-[#ede6dc] px-3 py-1 text-xs font-semibold text-[#7b694f]">
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-500">{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
