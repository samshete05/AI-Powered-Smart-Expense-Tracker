import { BrandLogo } from "../ui/BrandLogo";
import { AppIcon } from "../ui/AppIcon";

export function Sidebar({ sections, activeItem, onSelect, open, onClose, onOpenUpgrade }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-stone-950/30 transition-opacity xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[282px] flex-col border-r border-stone-300/60 bg-[#fdfcfc]/96 p-4 shadow-[0_25px_50px_rgba(83,67,51,0.14)] backdrop-blur-2xl transition-transform xl:static xl:w-auto xl:translate-x-0 xl:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:text-stone-900 xl:hidden"
          >
            <AppIcon name="close" className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelect?.("Transactions")}
          className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#a9682b] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(169,104,43,0.25)] transition hover:brightness-105"
        >
          <AppIcon name="plus" className="h-4 w-4" />
          Add transaction
        </button>

        <div className="mt-4 flex-1 overflow-y-auto rounded-[28px] bg-[#ede8e1] p-3">
          {sections.map((section) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b876c]">
                {section.label}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const active = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect?.(item.id);
                        onClose?.();
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[15px] font-medium transition ${
                        active
                          ? "bg-white text-stone-950 shadow-[0_10px_24px_rgba(83,67,51,0.08)]"
                          : "text-[#786755] hover:bg-white/60"
                      }`}
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-xl ${active ? "bg-[#f4efe7] text-[#a9682b]" : "bg-white/50 text-[#8a7658]"}`}>
                        <AppIcon name={item.icon} className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#de8d56,#eb9d63)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            <AppIcon name="trend" className="h-4 w-4" />
            Upgrade to Pro
          </button>
          <div className="rounded-2xl border border-stone-200 bg-[#faf7f3] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <AppIcon name="message" className="h-4 w-4" />
              Chat with creator
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
