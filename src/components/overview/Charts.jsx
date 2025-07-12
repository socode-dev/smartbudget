import LineChart from "./LineChart";
import PieChart from "./PieChart";

const Charts = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mb-6">
        Track your spending and category distribution
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex flex-col mb-4">
            <h3 className="text-lg font-medium">Income vs Expenses</h3>
          </div>

          <LineChart />
        </div>

        <div>
          <div className="flex flex-col mb-4">
            <h3 className="text-lg font-medium">Spending Breakdown</h3>
          </div>
          <PieChart />
        </div>
      </div>
    </>
  );
};

export default Charts;
