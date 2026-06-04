export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 text-emerald-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M4 8.5h16v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 10.5h16M15.5 14h2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-stone-600">
          Loading expenses...
        </p>
      </div>
    </div>
  );
}