import ExpensesBudgetOverview from "./ExpensesBudgetOverview";
import IncomeBudgetOverview from "./IncomeBudgetOveview";

const BudgetOverview = () => {
  return (
    <>
      <h2 className="text-3xl font-medium mb-2">Budget Overview</h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-8">
        Track how close you are meeting your goals.
      </p>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Income Budget */}
        <IncomeBudgetOverview />

        {/* Expense Budget */}
        <ExpensesBudgetOverview />
        {/* End of expense*/}
      </div>
    </>
  );
};

export default BudgetOverview;
