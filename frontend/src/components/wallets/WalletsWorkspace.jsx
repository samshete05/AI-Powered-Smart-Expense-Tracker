import { useMemo, useState } from "react";
import {
  createWallet,
  deleteWallet,
  transferBetweenWallets,
  updateWallet
} from "../../services/api";
import { formatCurrency, getGlobalCurrency } from "../../lib/formatters";
import { emitDataChanged } from "../../lib/dataEvents";
import { useWalletsPageData } from "../../hooks/useWalletsPageData";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { AppIcon, WalletTypeIcon } from "../ui/AppIcon";
import { useToast } from "../ui/ToastProvider";
import { TransferModal } from "./TransferModal";
import { WalletFormModal } from "./WalletFormModal";

function buildSeries(wallets, transactions, mode) {
  if (mode === "balance") {
    return wallets.map((wallet) => ({
      label: wallet.name,
      value: wallet.balance
    }));
  }

  const map = new Map(wallets.map((wallet) => [wallet._id, { label: wallet.name, value: 0 }]));
  transactions.forEach((transaction) => {
    const walletId = transaction.wallet?._id;
    if (!walletId || !map.has(walletId)) return;
    const item = map.get(walletId);
    item.value += transaction.type === "income" ? transaction.amount : -transaction.amount;
  });
  return Array.from(map.values());
}

function SimpleLineCard({ title, subtitle, total, series, accent = "#10b981" }) {
  const max = Math.max(...series.map((item) => Math.abs(item.value)), 1);
  const width = 460;
  const height = 200;
  const paddingX = 36;
  const paddingY = 22;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const path = series
    .map((item, index) => {
      const x = paddingX + (index / Math.max(series.length - 1, 1)) * chartWidth;
      const y = paddingY + chartHeight - (Math.max(Math.abs(item.value), 0) / max) * chartHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <AppIcon name="trend" className="h-4 w-4" />
            <span>{title}</span>
          </div>
          {subtitle ? <p className="mt-1 text-xs text-stone-500">{subtitle}</p> : null}
          <p className="mt-2 text-3xl font-bold text-stone-900">{formatCurrency(total)}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-xl border border-stone-200 bg-white text-[11px]">
          {["1W", "1M", "1Y"].map((tab) => (
            <button key={tab} className={`px-3 py-1.5 ${tab === "1M" ? "bg-[#f4eee7] text-stone-900" : "text-stone-500"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {series.some((item) => Math.abs(item.value) > 0) ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
            {[0, 0.5, 1].map((step) => {
              const y = paddingY + chartHeight - step * chartHeight;
              return <line key={step} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#ddd2c6" strokeDasharray="6 6" />;
            })}
            <path d={path} fill="none" stroke={accent} strokeWidth="2.5" />
            {series.map((item, index) => {
              const x = paddingX + (index / Math.max(series.length - 1, 1)) * chartWidth;
              const y = paddingY + chartHeight - (Math.max(Math.abs(item.value), 0) / max) * chartHeight;
              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="4" fill={accent} />
                  <text x={x - 12} y={height - 10} className="fill-stone-500 text-[11px]">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="grid h-[220px] place-items-center text-center text-sm text-stone-500">
            Not enough history to plot a trend yet.
          </div>
        )}
      </div>
    </section>
  );
}

export function WalletsWorkspace() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [savingWallet, setSavingWallet] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);
  const { data, loading, error, refetch } = useWalletsPageData();
  const { pushToast } = useToast();

  const totalBalance = useMemo(
    () => data.wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0),
    [data.wallets]
  );

  const walletsWithCounts = useMemo(
    () =>
      data.wallets.map((wallet) => ({
        ...wallet,
        transactionCount: data.transactions.filter((transaction) => transaction.wallet?._id === wallet._id).length
      })),
    [data.transactions, data.wallets]
  );

  const balanceSeries = useMemo(() => buildSeries(data.wallets, data.transactions, "balance"), [data.wallets, data.transactions]);
  const activitySeries = useMemo(() => buildSeries(data.wallets, data.transactions, "activity"), [data.wallets, data.transactions]);

  async function handleSaveWallet(form) {
    if (savingWallet) return;
    setSavingWallet(true);

    try {
      if (editingWallet) {
        await updateWallet(editingWallet._id, {
          name: form.name,
          type: form.type,
          balance: Number(form.balance || 0),
          currency: form.currency,
          color: form.color
        });
        pushToast({ title: "Saved", message: "Wallet updated successfully." });
      } else {
        await createWallet({
          name: form.name,
          type: form.type,
          balance: Number(form.balance || 0),
          currency: form.currency,
          color: form.color
        });
        pushToast({ title: "Saved", message: "Wallet added successfully." });
      }

      emitDataChanged({ type: "wallet-changed" });
      setWalletModalOpen(false);
      setEditingWallet(null);
      await refetch();
    } finally {
      setSavingWallet(false);
    }
  }

  async function handleTransfer(form) {
    if (savingTransfer) return;
    setSavingTransfer(true);

    try {
      await transferBetweenWallets({
        fromWalletId: form.fromWalletId,
        toWalletId: form.toWalletId,
        amount: Number(form.amount),
        note: form.note
      });
      emitDataChanged({ type: "wallet-transfer" });
      pushToast({ title: "Transferred", message: "Wallet balances updated after transfer." });
      setTransferModalOpen(false);
      await refetch();
    } finally {
      setSavingTransfer(false);
    }
  }

  async function handleDeleteWallet(wallet) {
    const confirmed = window.confirm(`Delete wallet "${wallet.name}"?`);
    if (!confirmed) return;
    await deleteWallet(wallet._id);
    emitDataChanged({ type: "wallet-deleted" });
    pushToast({ title: "Deleted", message: "Wallet removed successfully." });
    await refetch();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <SimpleLineCard title="Balance over time" total={totalBalance} series={balanceSeries} accent="#8b5cf6" />
        <SimpleLineCard
          title="Wallet activity over time"
          subtitle="Net income minus expense per wallet"
          total={0}
          series={activitySeries}
          accent="#10b981"
        />
      </div>

      <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditingWallet(null);
              setWalletModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#a9682b] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <AppIcon name="plus" className="h-4 w-4" />
            Add Wallet
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f1ede8] px-4 py-2.5 text-sm font-medium text-stone-900"
          >
            <AppIcon name="transfer" className="h-4 w-4" />
            Transfer
          </button>
        </div>
      </section>

      <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-sm text-stone-500">
                <th className="border-b border-stone-200 px-3 py-3 font-medium">Wallet</th>
                <th className="border-b border-stone-200 px-3 py-3 font-medium">Type</th>
                <th className="border-b border-stone-200 px-3 py-3 font-medium">Balance</th>
                <th className="border-b border-stone-200 px-3 py-3 font-medium">Currency</th>
                <th className="border-b border-stone-200 px-3 py-3 font-medium">Transactions</th>
                <th className="border-b border-stone-200 px-3 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {walletsWithCounts.map((wallet) => (
                <tr key={wallet._id} className="text-sm text-stone-900">
                  <td className="border-b border-stone-100 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 text-violet-600">
                        <WalletTypeIcon type={wallet.type} className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3">
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs text-violet-600 capitalize">
                      {wallet.type}
                    </span>
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3 font-semibold">{formatCurrency(wallet.balance)}</td>
                  <td className="border-b border-stone-100 px-3 py-3">
                    <span className="rounded-full bg-[#efebe6] px-2.5 py-1 text-xs text-stone-600">{wallet.currency}</span>
                  </td>
                  <td className="border-b border-stone-100 px-3 py-3">{wallet.transactionCount}</td>
                  <td className="border-b border-stone-100 px-3 py-3">
                    <div className="flex items-center gap-2 text-stone-500">
                      <button onClick={() => { setEditingWallet(wallet); setWalletModalOpen(true); }} className="rounded-lg border border-stone-200 bg-white p-2">
                        <AppIcon name="edit" className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDeleteWallet(wallet)} className="rounded-lg border border-rose-200 bg-white p-2 text-rose-500">
                        <AppIcon name="delete" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <WalletFormModal
        open={walletModalOpen}
        wallet={editingWallet}
        defaultCurrency={getGlobalCurrency()}
        onClose={() => {
          setWalletModalOpen(false);
          setEditingWallet(null);
        }}
        onSave={handleSaveWallet}
        saving={savingWallet}
      />

      <TransferModal
        open={transferModalOpen}
        wallets={data.wallets}
        onClose={() => setTransferModalOpen(false)}
        onSave={handleTransfer}
        saving={savingTransfer}
      />
    </div>
  );
}
