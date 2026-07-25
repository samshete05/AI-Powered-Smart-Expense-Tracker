import brandMark from "../../assets/logos/brand-mark.svg";

export function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={brandMark}
        alt="AI Powered Expense Tracker"
        className="h-10 w-10 rounded-2xl shadow-[0_14px_30px_rgba(169,104,43,0.22)]"
      />
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-lg font-bold leading-5 text-stone-900">AI Powered Expense Tracker</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a7658]">
            Daily finance workspace
          </p>
        </div>
      ) : null}
    </div>
  );
}
