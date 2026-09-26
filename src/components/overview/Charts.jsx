import LineChart from "../charts/LineChart";
import ExpenseBudgetProgress from "./ExpenseBudgetProgress";

const Charts = () => (
  <div className="space-y-4">
    <header>
      <h2 className="font-display text-xl font-semibold">Financial Overview</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Track your spending and category distribution
      </p>
    </header>

    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] min-[1280px]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <figure
        aria-labelledby="income-expenses-title"
        className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <header className="flex min-h-20 flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 sm:items-center">
          <div>
            <h3
              id="income-expenses-title"
              className="font-display text-base font-semibold"
            >
              Income vs Expenses
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Monthly income and expense totals
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            aria-label="Chart legend"
          >
            <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1.5">
              <span
                className="h-0.5 w-4 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Income
            </span>
            <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1.5">
              <span
                className="h-0.5 w-4 rounded-full bg-rose-500"
                aria-hidden="true"
              />
              Expenses
            </span>
          </div>
        </header>
        <div className="px-3 pb-4 pt-3 sm:px-5 sm:pb-5">
          <LineChart />
        </div>
      </figure>
      <ExpenseBudgetProgress />
    </div>
  </div>
);

export default Charts;
