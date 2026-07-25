export const DATA_CHANGED_EVENT = "expense-tracker:data-changed";

export function emitDataChanged(detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail }));
}
