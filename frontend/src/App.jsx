import { useState } from "react";
import { AnalyticsWorkspace } from "./components/analytics/AnalyticsWorkspace";
import { AutomationWorkspace } from "./components/automation/AutomationWorkspace";
import { BudgetsWorkspace } from "./components/budgets/BudgetsWorkspace";
import { CategoriesWorkspace } from "./components/categories/CategoriesWorkspace";
import { HeroBanner } from "./components/dashboard/HeroBanner";
import { InsightsCard } from "./components/dashboard/InsightsCard";
import { ModuleGrid } from "./components/dashboard/ModuleGrid";
import { OverviewGrid } from "./components/dashboard/OverviewGrid";
import { TransactionsCard } from "./components/dashboard/TransactionsCard";
import { WalletsCard } from "./components/dashboard/WalletsCard";
import { BudgetsCard } from "./components/dashboard/BudgetsCard";
import { Sidebar } from "./components/layout/Sidebar";
import { GoalsWorkspace } from "./components/goals/GoalsWorkspace";
import { TopActionBar } from "./components/layout/TopActionBar";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { ErrorState } from "./components/states/ErrorState";
import { RecurringWorkspace } from "./components/recurring/RecurringWorkspace";
import { LoadingState } from "./components/states/LoadingState";
import { TransactionsWorkspace } from "./components/transactions/TransactionsWorkspace";
import { UpgradeModal } from "./components/ui/UpgradeModal";
import { WalletsWorkspace } from "./components/wallets/WalletsWorkspace";
import { AppIcon } from "./components/ui/AppIcon";
import { dashboardModules } from "./data/dashboard";
import { navigationSections } from "./data/navigation";
import { setGlobalCurrency } from "./lib/formatters";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useDashboardData } from "./hooks/useDashboardData";
import { useEffect } from "react";

function App() {
  const [activeItem, setActiveItem] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { user, loading: userLoading, error: userError, savePreferences } = useCurrentUser();
  const { data, loading, error, refetch } = useDashboardData();

  const showOverview = activeItem === "Overview";
  const showTransactionsPage = activeItem === "Transactions";
  const showRecurringPage = activeItem === "Recurring";
  const showAnalyticsPage = activeItem === "Analytics";
  const showCategoriesPage = activeItem === "Categories";
  const showBudgetsPage = activeItem === "Budgets";
  const showGoalsPage = activeItem === "Goals";
  const showWalletsPage = activeItem === "Wallets";
  const showAutomationPage = activeItem === "Automation";

  useEffect(() => {
    setGlobalCurrency(user?.preferences?.currency || "INR");
  }, [user?.preferences?.currency]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(160deg,#e9e6e2_0%,#f2efeb_52%,#fdfcfc_100%)]">
        <div className="mx-auto flex min-h-screen max-w-[1540px] items-center justify-center">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-[linear-gradient(160deg,#e9e6e2_0%,#f2efeb_52%,#fdfcfc_100%)]">
        <div className="mx-auto flex min-h-screen max-w-[1540px] items-center justify-center px-4">
          <ErrorState message={userError} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(250,247,243,0.88),_transparent_20%),linear-gradient(160deg,#e9e6e2_0%,#f2efeb_52%,#fdfcfc_100%)] text-stone-800">
      <div className="mx-auto grid min-h-screen max-w-[1540px] grid-cols-1 xl:grid-cols-[282px_minmax(0,1fr)]">
        <Sidebar
          sections={navigationSections}
          activeItem={activeItem}
          onSelect={setActiveItem}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenUpgrade={() => setUpgradeOpen(true)}
        />

        <main className="min-w-0 p-3 sm:p-4 lg:p-5">
          <TopActionBar user={user} />
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-stone-200/80 bg-[#fdfcfc]/80 px-3 py-2 shadow-[0_10px_30px_rgba(83,67,51,0.04)] backdrop-blur xl:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-stone-200 bg-white text-stone-700"
            >
              <AppIcon name="menu" className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-stone-900">{activeItem}</p>
            <div className="w-9" />
          </div>

          {showTransactionsPage ? (
            <TransactionsWorkspace />
          ) : showRecurringPage ? (
            <RecurringWorkspace />
          ) : showAnalyticsPage ? (
            <AnalyticsWorkspace />
          ) : showCategoriesPage ? (
            <CategoriesWorkspace />
          ) : showBudgetsPage ? (
            <BudgetsWorkspace />
          ) : showGoalsPage ? (
            <GoalsWorkspace />
          ) : showWalletsPage ? (
            <WalletsWorkspace />
          ) : showAutomationPage ? (
            <AutomationWorkspace />
          ) : showOverview ? (
            <>
              <HeroBanner />

              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} onRetry={refetch} />
              ) : (
                <>
                  <OverviewGrid summary={data.summary} />

                  <section className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.82fr)]">
                    <div className="space-y-4">
                      <ModuleGrid modules={dashboardModules} />
                      <TransactionsCard transactions={data.recentTransactions} />
                    </div>

                    <div className="space-y-4">
                      <WalletsCard wallets={data.wallets} />
                      <BudgetsCard budgets={data.budgets} />
                      <InsightsCard insights={data.insights} recurringCandidates={data.recurringCandidates} />
                    </div>
                  </section>
                </>
              )}
            </>
          ) : (
            <>
              <HeroBanner />
              {loading ? <LoadingState /> : <OverviewGrid summary={data.summary} />}
            </>
          )}
        </main>
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      {!user?.preferences?.onboardingCompleted ? (
        <OnboardingFlow
          user={user}
          onComplete={async (payload) => {
            await savePreferences(payload);
            setActiveItem("Overview");
          }}
        />
      ) : null}
    </div>
  );
}

export default App;
