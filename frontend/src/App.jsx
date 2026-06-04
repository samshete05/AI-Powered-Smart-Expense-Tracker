import { useState } from "react";
import { HeroBanner } from "./components/dashboard/HeroBanner";
import { InsightsCard } from "./components/dashboard/InsightsCard";
import { ModuleGrid } from "./components/dashboard/ModuleGrid";
import { OverviewGrid } from "./components/dashboard/OverviewGrid";
import { TransactionsCard } from "./components/dashboard/TransactionsCard";
import { WalletsCard } from "./components/dashboard/WalletsCard";
import { BudgetsCard } from "./components/dashboard/BudgetsCard";
import { Sidebar } from "./components/layout/Sidebar";
import { ErrorState } from "./components/states/ErrorState";
import { LoadingState } from "./components/states/LoadingState";
import { TransactionsWorkspace } from "./components/transactions/TransactionsWorkspace";
import { dashboardModules } from "./data/dashboard";
import { navigationItems } from "./data/navigation";
import { useDashboardData } from "./hooks/useDashboardData";

function App() {
  const [activeItem, setActiveItem] = useState("Transactions");
  const { data, loading, error, refetch } = useDashboardData();

  const showTransactionsPage = activeItem === "Transactions";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(250,247,243,0.88),_transparent_20%),linear-gradient(160deg,#e9e6e2_0%,#f2efeb_52%,#fdfcfc_100%)] text-stone-800">
      <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar items={navigationItems} activeItem={activeItem} onSelect={setActiveItem} />

        <main className="p-5 md:p-7">
          {showTransactionsPage ? (
            <TransactionsWorkspace />
          ) : (
            <>
              <HeroBanner />

              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} onRetry={refetch} />
              ) : (
                <>
                  <OverviewGrid summary={data.summary} />

                  <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
                    <div className="space-y-6">
                      <ModuleGrid modules={dashboardModules} />
                      <TransactionsCard transactions={data.recentTransactions} />
                    </div>

                    <div className="space-y-6">
                      <WalletsCard wallets={data.wallets} />
                      <BudgetsCard budgets={data.budgets} />
                      <InsightsCard insights={data.insights} recurringCandidates={data.recurringCandidates} />
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
