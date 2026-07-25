import { useMemo, useRef, useState } from "react";
import { createCategory, createTransaction, createWallet, deleteTransaction, updateTransaction } from "../../services/api";
import { useTransactionsData } from "../../hooks/useTransactionsData";
import { emitDataChanged } from "../../lib/dataEvents";
import { getGlobalCurrency } from "../../lib/formatters";
import { useToast } from "../ui/ToastProvider";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { TransactionChartCard } from "./TransactionChartCard";
import { TransactionFormModal } from "./TransactionFormModal";
import { TransactionsTableCard } from "./TransactionsTableCard";
import { WalletFormModal } from "./WalletFormModal";
import { WalletsPanel } from "./WalletsPanel";

const initialFilters = {
  search: "",
  walletType: "all",
  type: "all",
  categoryId: "all",
  range: "all"
};

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    return headers.reduce((result, header, index) => {
      result[header] = values[index] || "";
      return result;
    }, {});
  });
}

export function TransactionsWorkspace() {
  const [filters, setFilters] = useState(initialFilters);
  const [chartRange, setChartRange] = useState("month");
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const importInputRef = useRef(null);
  const { data, loading, error, refetch } = useTransactionsData(filters, chartRange);
  const { pushToast } = useToast();

  const walletTypes = useMemo(
    () => Array.from(new Set(data.wallets.map((wallet) => wallet.type))).sort(),
    [data.wallets]
  );

  async function ensureCategory(form) {
    if (form.categoryId) return form.categoryId;
    if (!form.newCategoryName.trim()) return "";

    const createdCategory = await createCategory({
      name: form.newCategoryName.trim(),
      type: form.type,
      color: form.type === "income" ? "#16a34a" : "#f97316",
      icon: form.type === "income" ? "wallet" : "shopping"
    });

    return createdCategory._id;
  }

  async function handleSaveTransaction(form) {
    if (savingTransaction) return;
    setSavingTransaction(true);

    try {
      const categoryId = await ensureCategory(form);

      const payload = {
        type: form.type,
        amount: Number(form.amount),
        note: form.note,
        walletId: form.walletId || undefined,
        categoryId: categoryId || undefined,
        merchant: form.merchant,
        description: form.description,
        transactionDate: form.transactionDate
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, payload);
        pushToast({ title: "Saved", message: "Transaction updated successfully." });
      } else {
        await createTransaction(payload);
        pushToast({ title: "Saved", message: "Transaction added. Form is ready for another." });
      }

      emitDataChanged({ type: "transaction-changed" });
      setTransactionModalOpen(false);
      setEditingTransaction(null);
      await refetch();
    } finally {
      setSavingTransaction(false);
    }
  }

  async function handleSaveWallet(form) {
    if (savingWallet) return;
    setSavingWallet(true);

    try {
      await createWallet({
        name: form.name,
        type: form.type,
        balance: Number(form.balance || 0),
        currency: getGlobalCurrency(),
        color: form.color
      });

      emitDataChanged({ type: "wallet-created" });
      pushToast({ title: "Saved", message: "Wallet added successfully." });
      setWalletModalOpen(false);
      await refetch();
    } finally {
      setSavingWallet(false);
    }
  }

  async function handleDeleteTransaction(transaction) {
    const confirmed = window.confirm(`Delete transaction "${transaction.note || transaction.merchant || "Untitled"}"?`);
    if (!confirmed) return;
    await deleteTransaction(transaction._id);
    emitDataChanged({ type: "transaction-deleted" });
    pushToast({ title: "Deleted", message: "Transaction removed from history." });
    await refetch();
  }

  function handleExport() {
    const rows = [
      ["type", "amount", "note", "merchant", "description", "wallet", "walletType", "category", "transactionDate"],
      ...data.transactions.map((transaction) => [
        transaction.type,
        transaction.amount,
        transaction.note,
        transaction.merchant,
        transaction.description,
        transaction.wallet?.name || "",
        transaction.wallet?.type || "",
        transaction.category?.name || "",
        transaction.transactionDate
      ])
    ];

    downloadCsv("transactions-export.csv", rows);
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileText = await file.text();
    const rows = parseCsv(fileText);

    const knownWallets = [...data.wallets];
    const knownCategories = [...data.categories];

    for (const row of rows) {
      let wallet = knownWallets.find(
        (item) => item.name.toLowerCase() === (row.wallet || "").toLowerCase()
      );

      if (!wallet && row.wallet) {
        wallet = await createWallet({
          name: row.wallet,
          type: (row.walletType || "bank").toLowerCase(),
          balance: 0
        });
        knownWallets.push(wallet);
      }

      let category = knownCategories.find(
        (item) =>
          item.name.toLowerCase() === (row.category || "").toLowerCase() &&
          item.type === (row.type || "expense").toLowerCase()
      );

      if (!category && row.category) {
        category = await createCategory({
          name: row.category,
          type: (row.type || "expense").toLowerCase()
        });
        knownCategories.push(category);
      }

      await createTransaction({
        type: (row.type || "expense").toLowerCase(),
        amount: Number(row.amount || 0),
        note: row.note || "",
        merchant: row.merchant || "",
        description: row.description || "",
        walletId: wallet?._id,
        categoryId: category?._id,
        transactionDate: row.transactionDate || new Date().toISOString().slice(0, 10),
        source: "import"
      });
    }

    event.target.value = "";
    emitDataChanged({ type: "transactions-imported" });
    pushToast({ title: "Imported", message: `${rows.length} transaction${rows.length === 1 ? "" : "s"} added from CSV.` });
    await refetch();
  }

  function handleFilterChange(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_320px]">
        <TransactionChartCard
          analytics={data.analytics}
          range={chartRange}
          onRangeChange={setChartRange}
        />
        <WalletsPanel
          wallets={data.wallets}
          onAddWallet={() => setWalletModalOpen(true)}
        />
      </div>

      <TransactionsTableCard
        transactions={data.transactions}
        filters={filters}
        categories={data.categories}
        walletTypes={walletTypes}
        onFilterChange={handleFilterChange}
        onAddTransaction={() => {
          setEditingTransaction(null);
          setTransactionModalOpen(true);
        }}
        onEditTransaction={(transaction) => {
          setEditingTransaction(transaction);
          setTransactionModalOpen(true);
        }}
        onDeleteTransaction={handleDeleteTransaction}
        onExport={handleExport}
        onImport={() => importInputRef.current?.click()}
        onRefresh={refetch}
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImport}
      />

      <TransactionFormModal
        open={transactionModalOpen}
        transaction={editingTransaction}
        wallets={data.wallets}
        categories={data.categories}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onOpenWalletModal={() => setWalletModalOpen(true)}
        saving={savingTransaction}
      />

      <WalletFormModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSave={handleSaveWallet}
        saving={savingWallet}
      />
    </div>
  );
}
