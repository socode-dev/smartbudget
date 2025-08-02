// import PieChart from "./PieChart";
import LineChart from "../charts/LineChart";
import DoughnutChart from "../charts/DoughnutChart";

const Charts = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mb-6">
        Track your spending and category distribution
      </p>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <figure className="space-y-4 bg-[rgb(var(--color-bg-card))] rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium">Income vs Expenses</h3>

          {/* Line chart for income vs expenses */}
          <LineChart />
        </figure>

        <figure className="space-y-4 bg-[rgb(var(--color-bg-card))] rounded-lg p-4 shadow">
          <h3 className="text-lg font-medium">Budget Overview</h3>

          {/* Doughnut chart for budget overview */}
          <DoughnutChart page="overview" />
        </figure>
      </section>
    </>
  );
};

export default Charts;
