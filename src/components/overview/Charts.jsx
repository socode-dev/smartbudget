import LineChart from "../charts/LineChart";
import DoughnutChart from "../charts/DoughnutChart";
import useTransactionStore from "../../store/useTransactionStore";

const Charts = () => {
  const { budgets } = useTransactionStore();

  return (
    <>
      <h2 className="text-3xl font-bold mb-2">Financial Overview</h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-6">
        Track your spending and category distribution
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <figure className="space-y-4 bg-[rgb(var(--color-bg-card))] rounded-lg p-4 shadow">
          <h3 className="text-xl font-medium">Income vs Expenses</h3>

          {/* Line chart for income vs expenses */}
          <LineChart />
        </figure>

        <figure className="space-y-4 bg-[rgb(var(--color-bg-card))] rounded-lg p-4 shadow">
          <h3 className="text-xl font-medium">Budget Overview</h3>

          {/* Doughnut chart for budget overview and its empty state*/}
          {budgets.length === 0 ? (
            <div className="h-68 flex flex-col items-center justify-center text-[rgb(var(--color-muted))] text-center">
              <p className="text-lg font-medium mb-3">
                No budget data available
              </p>
              <p className="text-base">
                Set up a budget to start tracking your usage.
              </p>
            </div>
          ) : (
            <DoughnutChart page="overview" />
          )}
        </figure>
      </div>
    </>
  );
};

export default Charts;
