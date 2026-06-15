import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AppIcon } from "./AppIcon";

const ToastContext = createContext({ pushToast: () => {} });

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = ++toastId;
    const nextToast = {
      id,
      title: toast.title || "Saved",
      message: toast.message || "",
      tone: toast.tone || "success"
    };

    setToasts((current) => [...current, nextToast]);
    window.setTimeout(() => dismissToast(id), 2800);
  }, [dismissToast]);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-full max-w-[380px] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-[20px] border border-[#efd8bf] bg-[#fff6ea] p-4 shadow-[0_18px_40px_rgba(83,67,51,0.18)]"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ffe8d1] text-[#ce5c0e]">
                <AppIcon name="target" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#8f4a16]">{toast.title}</p>
                <p className="mt-1 text-sm text-[#bf7138]">{toast.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
