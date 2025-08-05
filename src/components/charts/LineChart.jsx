import { Line } from "react-chartjs-2";
import { useEffect, useRef } from "react";
import { useOverviewChartContext } from "../../context/OverviewChartContext";
import useTransactionStore from "../../store/useTransactionStore";

const LineChart = () => {
  const chartRef = useRef(null);
  const {
    monthlyIncome,
    monthlyExpenses,
    incomeVsExpensesData,
    incomeVsExpensesOptions,
  } = useOverviewChartContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-68 flex flex-col items-center justify-center">
      {monthlyIncome.length === 0 && monthlyExpenses.length === 0 ? (
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
