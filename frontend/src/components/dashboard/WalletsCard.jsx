import { formatCurrency } from "../../lib/formatters";

export function WalletsCard({ wallets }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-[#fdfcfc]/95 p-6 shadow-[0_22px_60px_rgba(83,67,51,0.08)] backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7658]">Wallets</p>
      <h2 className="mt-2 text-[26px] font-bold">Balances by account</h2>
      <div className="mt-5 space-y-4">
        {wallets.map((wallet) => (
          <div key={wallet._id} className="rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{wallet.name}</p>
                <p className="mt-1 text-sm capitalize text-stone-500">{wallet.type}</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(wallet.balance)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
