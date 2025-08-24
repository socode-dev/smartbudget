import { Line } from "react-chartjs-2";
import { useEffect, useRef } from "react";
import { useOverviewChartContext } from "../../context/OverviewChartContext";

const LineChart = () => {
  const chartRef = useRef(null);
  const chartContext = useOverviewChartContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  const monthlyIncome = chartContext.monthlyIncome;
  const monthlyExpenses = chartContext.monthlyExpenses;
  const incomeVsExpensesData = chartContext.incomeVsExpensesData;
  const incomeVsExpensesOptions = chartContext.incomeVsExpensesOptions;

  return (
    <div className="w-full h-68 flex flex-col items-center justify-center">
      {monthlyIncome[0] === 0 && monthlyExpenses[0] === 0 ? (
        <div className="text-[rgb(var(--color-muted))] text-center">
          <p className="text-lg font-medium mb-3">
            No income or expenses data available.
          </p>
          <p className="text-sm">
            Add some transactions too see your financial trends.
          </p>
        </div>
      ) : (
        <Line
          ref={chartRef}
          data={incomeVsExpensesData}
          options={incomeVsExpensesOptions}
        />
      )}
    </div>
  );
};

export default LineChart;
