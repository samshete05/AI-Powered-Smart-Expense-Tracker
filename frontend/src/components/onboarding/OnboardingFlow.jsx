import { useMemo, useState } from "react";
import { AppIcon } from "../ui/AppIcon";

const rupee = "\u20B9";
const yen = "\u00A5";
const pound = "\u00A3";
const euro = "\u20AC";

const currencyOptions = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: euro },
  { value: "GBP", label: "British Pound", symbol: pound },
  { value: "JPY", label: "Japanese Yen", symbol: yen },
  { value: "INR", label: "Indian Rupee", symbol: rupee }
];

const focusOptions = [
  { value: "Track Daily Expenses", subtitle: "Know where every penny goes", icon: "wallet" },
  { value: "Budget Smarter", subtitle: "Set limits and stick to them", icon: "target" },
  { value: "Track Investments", subtitle: "Monitor your portfolio growth", icon: "trend" },
  { value: "AI Financial Insights", subtitle: "Get smart spending analysis", icon: "automation" },
  { value: "Financial Reports", subtitle: "Visualize your money flow", icon: "analytics" },
  { value: "Multiple Accounts", subtitle: "Manage all wallets in one place", icon: "transactions" }
];

const incomeOptions = [
  { value: "Under $25,000 / year", icon: "target" },
  { value: "$25,000 - $50,000 / year", icon: "goal" },
  { value: "$50,000 - $100,000 / year", icon: "categories" },
  { value: "$100,000+ / year", icon: "trend" },
  { value: "Prefer not to say", icon: "settings" }
];

function StepShell({ step, title, subtitle, children, onSkip }) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(255,248,233,0.88),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,245,219,0.72),_transparent_18%),linear-gradient(160deg,#fbf8f1_0%,#fdfcf9_50%,#f9f6ee_100%)]">
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-[#ffb31a]" />
          <div className="absolute right-[13%] top-[16%] h-2.5 w-2.5 rounded-full bg-[#f6be24]" />
          <div className="absolute left-[32%] top-[68%] h-1.5 w-1.5 rounded-full bg-[#f2c14d]" />
          <div className="absolute right-[24%] top-[72%] h-2 w-2 rounded-full bg-[#ed9a38]" />
          <div className="absolute right-[11%] bottom-[20%] h-2.5 w-2.5 rounded-full bg-[#d9640f]" />
        </div>

        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className="absolute right-6 top-6 text-sm font-medium text-stone-500"
          >
            Skip
          </button>
        ) : null}

        <div className="w-full max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#ad5818]">{step}</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#241c15] sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-500 sm:text-[19px]">{subtitle}</p>
          <div className="mx-auto mt-10 max-w-4xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SelectCard({ active, onClick, icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[26px] border px-5 py-5 text-left transition ${
        active
          ? "border-[#ce5c0e] bg-[#fff7df] shadow-[0_18px_40px_rgba(206,92,14,0.15)]"
          : "border-stone-200 bg-white/92 shadow-[0_8px_20px_rgba(83,67,51,0.04)]"
      }`}
    >
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${active ? "bg-[#ce5c0e] text-white" : "bg-[#f4f0eb] text-stone-500"}`}>
        {typeof icon === "string" && icon.length <= 2 ? <span className="text-3xl font-bold">{icon}</span> : <AppIcon name={icon} className="h-6 w-6" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-stone-900 sm:text-[18px]">{title}</p>
        {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
      </div>
      <span className={`grid h-8 w-8 place-items-center rounded-full border ${active ? "border-[#d68d00] bg-[#ffb31a]" : "border-stone-200 bg-white"}`}>
        {active ? <span className="h-3 w-3 rounded-full bg-white" /> : null}
      </span>
    </button>
  );
}

export function OnboardingFlow({ user, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [currency, setCurrency] = useState(user?.preferences?.currency || "INR");
  const [focusAreas, setFocusAreas] = useState(user?.preferences?.focusAreas || []);
  const [incomeRange, setIncomeRange] = useState(user?.preferences?.incomeRange || "");
  const [onboardingNotes, setOnboardingNotes] = useState(user?.preferences?.onboardingNotes || "");
  const [saving, setSaving] = useState(false);

  const canContinue = useMemo(() => {
    if (stepIndex === 0) return Boolean(currency);
    if (stepIndex === 1) return focusAreas.length > 0 || onboardingNotes.trim();
    if (stepIndex === 2) return Boolean(incomeRange);
    return true;
  }, [currency, focusAreas, incomeRange, onboardingNotes, stepIndex]);

  function toggleFocus(value) {
    setFocusAreas((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  async function finishOnboarding() {
    if (saving) return;
    setSaving(true);

    try {
      await onComplete({
        currency,
        focusAreas,
        incomeRange,
        onboardingNotes,
        onboardingCompleted: true
      });
    } finally {
      setSaving(false);
    }
  }

  if (stepIndex === 3) {
    return (
      <StepShell
        step="STEP 5 OF 5"
        title="You're all set!"
        subtitle="Your personalized dashboard is ready. Start tracking your finances like a pro."
      >
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-[#ce5c0e] text-white shadow-[0_25px_50px_rgba(206,92,14,0.25)]">
            <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m4 12 5 5L20 6" />
            </svg>
          </div>
          <button
            type="button"
            onClick={finishOnboarding}
            disabled={saving}
            className="mt-12 inline-flex items-center gap-3 rounded-[22px] bg-[#ce5c0e] px-10 py-5 text-xl font-semibold text-white shadow-[0_22px_40px_rgba(206,92,14,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Open Dashboard
            <span className="text-2xl">{">"}</span>
          </button>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      step={stepIndex === 0 ? "STEP 2 OF 5" : stepIndex === 1 ? "STEP 3 OF 5" : "STEP 4 OF 5"}
      title={
        stepIndex === 0 ? "Pick your currency" : stepIndex === 1 ? "What brings you here?" : "Your monthly income?"
      }
      subtitle={
        stepIndex === 0
          ? "We'll use this across your dashboard, reports, and budgets."
          : stepIndex === 1
            ? "Select all that apply - we'll tailor your dashboard accordingly."
            : "This helps us personalize budgeting insights for you."
      }
      onSkip={finishOnboarding}
    >
      {stepIndex === 0 ? (
        <div className="mx-auto max-w-3xl space-y-4">
          {currencyOptions.map((option) => (
            <SelectCard
              key={option.value}
              active={currency === option.value}
              onClick={() => setCurrency(option.value)}
              icon={option.symbol}
              title={option.label}
              subtitle={option.value}
            />
          ))}
        </div>
      ) : stepIndex === 1 ? (
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-2">
            {focusOptions.map((option) => (
              <SelectCard
                key={option.value}
                active={focusAreas.includes(option.value)}
                onClick={() => toggleFocus(option.value)}
                icon={option.icon}
                title={option.value}
                subtitle={option.subtitle}
              />
            ))}
          </div>
          <input
            value={onboardingNotes}
            onChange={(event) => setOnboardingNotes(event.target.value)}
            placeholder="Something else? Tell us..."
            className="mt-6 w-full rounded-[22px] border border-stone-200 bg-white px-5 py-4 text-base text-stone-800 outline-none"
          />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-4">
          {incomeOptions.map((option) => (
            <SelectCard
              key={option.value}
              active={incomeRange === option.value}
              onClick={() => setIncomeRange(option.value)}
              icon={option.icon}
              title={option.value}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={!canContinue || saving}
        onClick={() => {
          if (stepIndex < 2) {
            setStepIndex((current) => current + 1);
          } else {
            setStepIndex(3);
          }
        }}
        className="mt-10 inline-flex items-center gap-3 rounded-[22px] bg-[#ce5c0e] px-12 py-5 text-xl font-semibold text-white shadow-[0_22px_40px_rgba(206,92,14,0.18)] disabled:cursor-not-allowed disabled:bg-[#e7b89b] disabled:shadow-none"
      >
        Continue
        <span className="text-2xl">{">"}</span>
      </button>
    </StepShell>
  );
}
