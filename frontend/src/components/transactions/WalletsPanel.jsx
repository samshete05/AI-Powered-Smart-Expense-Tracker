import { formatCurrency } from "../../lib/formatters";
import { AppIcon, WalletTypeIcon } from "../ui/AppIcon";

export function WalletsPanel({ wallets, onAddWallet }) {
  return (
    <aside className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7658]">Wallets</p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">Wallet balances</h2>
        </div>
        <button
          onClick={onAddWallet}
          className="inline-flex items-center gap-2 rounded-xl border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-2 text-xs font-medium text-[#211a12]"
        >
          <AppIcon name="plus" className="h-3.5 w-3.5" />
          Add wallet
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {wallets.length ? (
          wallets.map((wallet) => (
            <div key={wallet._id} className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-white text-stone-600">
                    <WalletTypeIcon type={wallet.type} className="h-3.5 w-3.5" />
                  </span>
                  <div>
                  <p className="text-sm font-semibold text-stone-900">{wallet.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                    {wallet.type}
                  </p>
                  </div>
                </div>
                <p className="text-base font-bold text-stone-900">
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[18px] border border-dashed border-stone-300 bg-[#faf7f3] p-5 text-sm text-stone-500">
            No wallets yet. Add a cash, UPI, bank, or card wallet to start tracking balances.
          </div>
        )}
      </div>
    </aside>
  );
}
