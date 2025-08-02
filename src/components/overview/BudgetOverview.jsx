const BudgetOverview = () => {
  return (
    <>
      <h2 className="text-xl font-medium mb-2">Budget Overview</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mb-6">
        Track how close you are meeting your goals.
      </p>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Income Budget */}
        <div>
          <h3 className="text-lg font-medium mb-2">Income Budget</h3>
          <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="budget-ring-income"></span>
              <span className="text-3xl font-bold text-[rgb(var(--color-text))]">
                72%
              </span>
            </div>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              72% of $5,000 goal reached
            </p>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              <b>Remaining:</b> $1,400
            </p>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              <b>Status:</b>{" "}
              <span className="text-[rgb(var(--color-brand))]">On Track</span>
            </p>
          </div>
        </div>

        {/* Expense Budget */}
        <div>
          <h3 className="text-lg font-medium mb-2">Expense Budget</h3>
          <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="budget-ring-expense"></span>
              <span className="text-3xl font-bold text-[rgb(var(--color-text))]">
                83%
              </span>
            </div>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              83% of $3,500 limit used
            </p>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              <b>Remaining:</b> $595
            </p>
            <p className="text-sm text-[rgb(var(--color-muted))]">
              <b>Status:</b>{" "}
              <span className="text-[rgb(var(--color-brand))]">
                Warning - nearing limit
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetOverview;
