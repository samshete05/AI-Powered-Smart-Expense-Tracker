import { formatCurrency } from "../../lib/formatters";

export function WalletsCard({ wallets }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)] backdrop-blur-xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7658]">Wallets</p>
      <h2 className="mt-1 text-lg font-bold text-stone-900">Balances</h2>
      <div className="mt-4 space-y-3">
        {wallets.map((wallet) => (
          <div key={wallet._id} className="rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">{wallet.name}</p>
                <p className="mt-1 text-xs capitalize text-stone-500">{wallet.type}</p>
              </div>
              <p className="text-base font-bold text-stone-900">{formatCurrency(wallet.balance)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
