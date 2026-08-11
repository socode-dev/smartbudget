import { Line } from "react-chartjs-2";
import { useEffect, useRef } from "react";
import { useOverviewChartContext } from "../../context/OverviewChartContext";
import { formatAmount } from "../../utils/formatAmount";
import useCurrencyStore from "../../store/useCurrencyStore";

export const ChartSummary = ({ id, children }) => (
    <p id={id} className="sr-only">{children}</p>
)

const LineChart = () => {
  const chartRef = useRef(null);
  const chartContext = useOverviewChartContext();
  const selectedCurrency = useCurrencyStore(state => state.selectedCurrency);

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

  const { labels, datasets } = incomeVsExpensesData;

  const incomeDataset = datasets.find(dataset => dataset.label === "Income");
  const expensesDataset = datasets.find(dataset => dataset.label === "Expenses");

  const linseSummary = labels.map((month, index) => (
    `${month}: income ${formatAmount(incomeDataset.data[index], selectedCurrency)}, expenses ${formatAmount(expensesDataset.data[index], selectedCurrency)}`
  )).join(". ");

  return (
    <div aria-describedby="income-expenses-summary" className="w-full h-68 flex flex-col items-center justify-center">
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
        <>
          <ChartSummary id="income-expenses-summary">
            Income and expenses by month. {linseSummary}
          </ChartSummary>

          <Line
            ref={chartRef}
            data={incomeVsExpensesData}
            options={incomeVsExpensesOptions}
          />
        </>
      )}
    </div>
  );
};

export default LineChart;
