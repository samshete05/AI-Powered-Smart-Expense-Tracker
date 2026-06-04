export function InsightsCard({ insights, recurringCandidates }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)] backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">AI Insights</p>
      <h2 className="mt-2 text-[26px] font-bold">What to act on next</h2>
      <div className="mt-5 space-y-4">
        {insights.map((item) => (
          <div key={item} className="flex gap-3 rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-linear-to-r from-[#d4c4af] to-[#b89f7a]" />
            <p className="text-sm leading-6 text-stone-600">{item}</p>
          </div>
        ))}
      </div>

      {recurringCandidates.length > 0 ? (
        <div className="mt-5 rounded-[18px] border border-[#e3d8ca] bg-[#f6f1eb] p-4">
          <p className="text-sm font-semibold text-stone-800">Recurring merchants detected</p>
          <div className="mt-3 space-y-2">
            {recurringCandidates.map((candidate) => (
              <div key={`${candidate._id.merchant}-${candidate._id.amount}`} className="flex items-center justify-between text-sm text-stone-600">
                <span>{candidate._id.merchant}</span>
                <span>{candidate.count} times</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
