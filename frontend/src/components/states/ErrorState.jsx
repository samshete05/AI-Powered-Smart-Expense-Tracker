export function ErrorState({ message, onRetry }) {
  return (
    <div className="mt-6 rounded-[24px] border border-rose-200 bg-[#fff8f7] p-10 shadow-[0_22px_60px_rgba(83,67,51,0.08)] backdrop-blur-xl">
      <p className="text-lg font-semibold text-rose-700">Could not load backend data</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-600">{message}</p>
      <button
        onClick={onRetry}
        className="mt-5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700"
      >
        Retry
      </button>
    </div>
  );
}
