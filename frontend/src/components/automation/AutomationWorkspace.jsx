import { useMemo, useState } from "react";
import {
  createTransaction,
  parseEmailInvoice,
  parseReceipt,
  parseSmsText
} from "../../services/api";
import { useAutomationData } from "../../hooks/useAutomationData";
import { emitDataChanged } from "../../lib/dataEvents";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { AppIcon, WalletTypeIcon, getCategoryIconName } from "../ui/AppIcon";
import { useToast } from "../ui/ToastProvider";

const automationOptions = [
  {
    id: "sms",
    title: "SMS parsing",
    subtitle: "Paste the bank or UPI message and review the extracted transaction."
  },
  {
    id: "ocr",
    title: "OCR parsing",
    subtitle: "Upload a receipt or screenshot and confirm the detected details."
  },
  {
    id: "email",
    title: "Email invoice",
    subtitle: "Paste invoice email details and turn them into a transaction."
  }
];

function ShellCard({ title, subtitle, children }) {
  return (
    <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7658]">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm text-stone-700">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function ReviewPanel({ draft, wallets, categories, busy, onChange, onConfirm, onReset }) {
  const selectedCategory = categories.find((category) => category._id === draft.categoryId);
  const selectedWallet = wallets.find((wallet) => wallet._id === draft.walletId);

  return (
    <div className="rounded-[20px] border border-[#ead8c3] bg-[#fbf7f1] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">Please confirm these transaction details</p>
          <p className="mt-1 text-xs text-stone-500">
            If anything looks wrong, update the amount, category, type, date, wallet, or note before continuing.
          </p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#a9682b]">
          {draft.reviewRequired ? "Review required" : "Ready"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="Title">
          <input
            value={draft.title || ""}
            onChange={(event) => onChange("title", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
        </Field>
        <Field label="Merchant">
          <input
            value={draft.merchant || ""}
            onChange={(event) => onChange("merchant", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
        </Field>
        <Field label="Amount">
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.amount || ""}
            onChange={(event) => onChange("amount", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={String(draft.date || "").slice(0, 10)}
            onChange={(event) => onChange("date", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
        </Field>
        <Field label="Type">
          <select
            value={draft.type || "expense"}
            onChange={(event) => onChange("type", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </Field>
        <Field label="Wallet">
          <select
            value={draft.walletId || ""}
            onChange={(event) => onChange("walletId", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          >
            <option value="">Select wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet._id} value={wallet._id}>
                {wallet.name} ({wallet.type})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select
            value={draft.categoryId || ""}
            onChange={(event) => onChange("categoryId", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          >
            <option value="">Select category</option>
            {categories
              .filter((category) => category.type === (draft.type || "expense"))
              .map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Note">
          <input
            value={draft.note || ""}
            onChange={(event) => onChange("note", event.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
        </Field>
      </div>

      <Field label="Description / raw text">
        <textarea
          rows="4"
          value={draft.rawText || ""}
          onChange={(event) => onChange("rawText", event.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
        />
      </Field>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-white px-3 py-2 text-xs text-stone-600">
            <div className="font-semibold text-stone-900">{formatCurrency(Number(draft.amount || 0))}</div>
            <div>Amount</div>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-xs text-stone-600">
            <div className="font-semibold text-stone-900">{formatDate(draft.date || new Date())}</div>
            <div>Date</div>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-xs text-stone-600">
            <div className="flex items-center gap-1 font-semibold text-stone-900">
              <AppIcon name={getCategoryIconName(selectedCategory?.icon)} className="h-3.5 w-3.5" />
              <span>{selectedCategory?.name || "Uncategorized"}</span>
            </div>
            <div>Category</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedWallet ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs text-stone-600">
              <WalletTypeIcon type={selectedWallet.type} className="h-3.5 w-3.5" />
              {selectedWallet.name}
            </div>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700"
          >
            Start over
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl bg-[#a9682b] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Adding..." : "Looks correct, add transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SmsForm({ value, onChange }) {
  return (
    <Field label="SMS text">
      <textarea
        rows="8"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste SMS text here..."
        className="w-full rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
      />
    </Field>
  );
}

function OcrForm({ text, onTextChange, onFileChange }) {
  return (
    <div className="grid gap-3">
      <Field label="Receipt image or PDF">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-700"
        />
      </Field>
      <Field label="OCR text or notes">
        <textarea
          rows="7"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Paste extracted text or helpful notes..."
          className="w-full rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
        />
      </Field>
    </div>
  );
}

function EmailForm({ values, onChange }) {
  return (
    <div className="grid gap-3">
      <Field label="Email subject">
        <input
          value={values.subject}
          onChange={(event) => onChange("subject", event.target.value)}
          placeholder="Invoice subject"
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
        />
      </Field>
      <Field label="From">
        <input
          value={values.from}
          onChange={(event) => onChange("from", event.target.value)}
          placeholder="Sender or email address"
          className="rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
        />
      </Field>
      <Field label="Email body">
        <textarea
          rows="6"
          value={values.body}
          onChange={(event) => onChange("body", event.target.value)}
          placeholder="Paste invoice body..."
          className="w-full rounded-xl border border-stone-200 bg-[#faf7f3] px-3 py-2.5 text-sm text-stone-800 outline-none"
        />
      </Field>
    </div>
  );
}

export function AutomationWorkspace() {
  const { data, loading, error, refetch } = useAutomationData();
  const { pushToast } = useToast();
  const [activeOption, setActiveOption] = useState("sms");
  const [smsText, setSmsText] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrFile, setOcrFile] = useState(null);
  const [emailDraft, setEmailDraft] = useState({ subject: "", from: "", body: "" });
  const [drafts, setDrafts] = useState({ sms: null, ocr: null, email: null });
  const [busyKey, setBusyKey] = useState("");

  const activeDraft = drafts[activeOption];
  const completionScore = useMemo(
    () => Object.values(drafts).filter(Boolean).length,
    [drafts]
  );

  async function handleParse(kind) {
    setBusyKey(`parse-${kind}`);

    try {
      if (kind === "sms") {
        const parsed = await parseSmsText({ text: smsText });
        setDrafts((current) => ({ ...current, sms: { ...parsed, note: parsed.title || parsed.merchant || "SMS import" } }));
      }

      if (kind === "ocr") {
        const parsed = await parseReceipt({
          rawText: ocrText,
          file: ocrFile,
          fileName: ocrFile?.name
        });
        setDrafts((current) => ({ ...current, ocr: { ...parsed, note: parsed.title || parsed.merchant || "OCR import" } }));
      }

      if (kind === "email") {
        const parsed = await parseEmailInvoice(emailDraft);
        setDrafts((current) => ({ ...current, email: { ...parsed, note: parsed.title || parsed.merchant || "Email invoice" } }));
      }
    } finally {
      setBusyKey("");
    }
  }

  function updateDraft(kind, field, value) {
    setDrafts((current) => ({
      ...current,
      [kind]: {
        ...current[kind],
        [field]: field === "amount" ? value : value
      }
    }));
  }

  async function confirmDraft(kind) {
    const draft = drafts[kind];
    if (!draft) return;

    setBusyKey(`save-${kind}`);

    try {
      await createTransaction({
        type: draft.type || "expense",
        amount: Number(draft.amount || 0),
        note: draft.note || draft.title || draft.merchant || `${kind} import`,
        merchant: draft.merchant || "",
        description: draft.rawText || "",
        walletId: draft.walletId || undefined,
        categoryId: draft.categoryId || undefined,
        transactionDate: draft.date,
        source: kind === "email" ? "email" : kind,
        rawText: draft.rawText || ""
      });

      emitDataChanged({ type: "transaction-created", source: kind });
      pushToast({ title: "Saved", message: "Parsed transaction added successfully." });
      setDrafts((current) => ({ ...current, [kind]: null }));
      await refetch();
    } finally {
      setBusyKey("");
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ShellCard title="Automation options" subtitle="Only three flows are available here: SMS parsing, OCR parsing, and email invoice import.">
          <div className="space-y-2">
            {automationOptions.map((option) => {
              const active = option.id === activeOption;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveOption(option.id)}
                  className={`w-full rounded-[18px] border px-4 py-3 text-left transition ${
                    active
                      ? "border-[#d8b08a] bg-[#fbf3e9] shadow-[0_12px_30px_rgba(169,104,43,0.12)]"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-2xl ${active ? "bg-[#a9682b] text-white" : "bg-[#f4efe7] text-[#a9682b]"}`}>
                      <AppIcon
                        name={option.id === "sms" ? "message" : option.id === "ocr" ? "camera" : "mail"}
                        className="h-4 w-4"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{option.title}</p>
                      <p className="text-xs text-stone-500">{option.subtitle}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ShellCard>

        <ShellCard
          title="Processing overview"
          subtitle="Parse the source, review the extracted values, correct anything that looks wrong, and then add the transaction."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[16px] bg-[#faf7f3] p-3">
              <p className="text-xs text-stone-500">Wallets available</p>
              <p className="mt-1 text-2xl font-bold text-stone-900">{data.wallets.length}</p>
            </div>
            <div className="rounded-[16px] bg-[#faf7f3] p-3">
              <p className="text-xs text-stone-500">Categories available</p>
              <p className="mt-1 text-2xl font-bold text-stone-900">{data.categories.length}</p>
            </div>
            <div className="rounded-[16px] bg-[#faf7f3] p-3">
              <p className="text-xs text-stone-500">Drafts reviewed</p>
              <p className="mt-1 text-2xl font-bold text-stone-900">{completionScore}</p>
            </div>
          </div>
        </ShellCard>
      </section>

      <ShellCard
        title={automationOptions.find((option) => option.id === activeOption)?.title || "Automation"}
        subtitle={automationOptions.find((option) => option.id === activeOption)?.subtitle}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            {activeOption === "sms" ? (
              <SmsForm value={smsText} onChange={setSmsText} />
            ) : activeOption === "ocr" ? (
              <OcrForm text={ocrText} onTextChange={setOcrText} onFileChange={setOcrFile} />
            ) : (
              <EmailForm
                values={emailDraft}
                onChange={(field, value) => setEmailDraft((current) => ({ ...current, [field]: value }))}
              />
            )}

            <button
              type="button"
              onClick={() => handleParse(activeOption)}
              disabled={busyKey === `parse-${activeOption}`}
              className="rounded-xl bg-[#a9682b] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyKey === `parse-${activeOption}`
                ? "Parsing..."
                : activeOption === "sms"
                  ? "Parse SMS"
                  : activeOption === "ocr"
                    ? "Parse receipt"
                    : "Parse email invoice"}
            </button>

            {activeDraft ? (
              <ReviewPanel
                draft={activeDraft}
                wallets={data.wallets}
                categories={data.categories}
                busy={busyKey === `save-${activeOption}`}
                onChange={(field, value) => updateDraft(activeOption, field, value)}
                onConfirm={() => confirmDraft(activeOption)}
                onReset={() => setDrafts((current) => ({ ...current, [activeOption]: null }))}
              />
            ) : null}
          </div>

          <div className="rounded-[20px] border border-stone-200 bg-[#faf7f3] p-4">
            <p className="text-sm font-semibold text-stone-900">What gets checked</p>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              <div className="flex items-start gap-2">
                <AppIcon name="target" className="mt-0.5 h-4 w-4 text-[#a9682b]" />
                <span>Amount, transaction type, date, merchant, and category are extracted before save.</span>
              </div>
              <div className="flex items-start gap-2">
                <AppIcon name="edit" className="mt-0.5 h-4 w-4 text-[#a9682b]" />
                <span>You can correct every important transaction field before it is added.</span>
              </div>
              <div className="flex items-start gap-2">
                <AppIcon name="analytics" className="mt-0.5 h-4 w-4 text-[#a9682b]" />
                <span>Once confirmed, the new transaction refreshes the app data for totals, graphs, and dashboards.</span>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7658]">Reminders</p>
              <div className="mt-3 space-y-2">
                {data.reminders.length ? (
                  data.reminders.slice(0, 3).map((reminder) => (
                    <div key={reminder.id} className="rounded-xl bg-[#faf7f3] px-3 py-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-stone-900">{reminder.name}</span>
                        <span className="text-xs font-semibold text-[#a9682b]">in {reminder.dueInDays}d</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">{formatCurrency(reminder.amount)} on {formatDate(reminder.dueDate)}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-stone-300 px-3 py-4 text-xs text-stone-500">
                    No reminders due soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ShellCard>
    </div>
  );
}
