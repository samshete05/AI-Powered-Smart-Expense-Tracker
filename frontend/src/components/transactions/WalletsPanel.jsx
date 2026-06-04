import { formatCurrency } from "../../lib/formatters";

export function WalletsPanel({ wallets, onAddWallet }) {
  return (
    <aside className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Wallets</p>
          <h2 className="mt-2 text-[22px] font-bold text-stone-900">Balances by wallet type</h2>
        </div>
        <button
          onClick={onAddWallet}
          className="rounded-md border border-[#fdfcfc] bg-[#f5f2ef] px-3 py-1.5 text-xs font-medium text-[#211a12]"
        >
          Add wallet
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {wallets.length ? (
          wallets.map((wallet) => (
            <div key={wallet._id} className="rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{wallet.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                    {wallet.type}
                  </p>
                </div>
                <p className="text-lg font-bold text-stone-900">
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
