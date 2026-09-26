import IncomeBudgetOverview from "./IncomeBudgetOveview";
import ExpensesBudgetOverview from "./ExpensesBudgetOverview";

const BudgetOverview = () => (
  <>
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="font-display text-base font-semibold">
          Income &amp; Expense Budgets
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Track progress toward your goals and limits.
        </p>
      </div>
    </header>
    <div className="space-y-4">
      <IncomeBudgetOverview />
      <ExpensesBudgetOverview />
    </div>
  </>
);

export default BudgetOverview;
