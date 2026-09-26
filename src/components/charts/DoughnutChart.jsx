import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { useReportChartContext } from "../../context/ReportChartContext";
import { useOverviewChartContext } from "../../context/OverviewChartContext";
import { ChartSummary } from "./LineChart";
import { formatAmount } from "../../utils/formatAmount";
import useCurrencyStore from "../../store/useCurrencyStore";

const DoughnutChart = ({ page }) => {
  const chartRef = useRef(null);
  const reportContext = useReportChartContext();
  const overviewContext = useOverviewChartContext();
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);

  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      chart?.destroy();
    };
  }, []);

  let data;
  let options;

  switch (true) {
    case page === "overview":
      data = overviewContext.budgetOverviewData;
      options = overviewContext.budgetOverviewOptions;
      break;
    case page === "reports":
      data = reportContext.doughnutChartData;
      options = reportContext.doughnutChartOptions;
      break;
    default:
      data = overviewContext.budgetOverviewData;
      options = overviewContext.budgetOverviewOptions;
      break;
  }

  const labels = data.labels;
  const values = data.datasets[0].data;

  const budgetSummary = labels
    .map(
      (label, index) =>
        `${label}: ${formatAmount(values[index], selectedCurrency)}`,
    )
    .join(". ");

  const summaryId = page === "reports" ? "report-category-summary" : "budget-overview-summary";

  return (
    <div
      className={
        page === "reports"
          ? "relative mx-auto h-56 min-w-0 w-full max-w-64"
          : "grow w-full flex flex-col items-center"
      }
    >
      <ChartSummary id={summaryId}>
        {page === "reports"
          ? "Expense category breakdown."
          : "Budget overview."}{" "}
        {budgetSummary}
      </ChartSummary>

      <Doughnut
        ref={chartRef}
        data={data}
        options={options}
        height={300}
        role="img"
        aria-describedby={summaryId}
        aria-label={
          page === "reports" ? "Expense category breakdown" : "Budget overview"
        }
      />
    </div>
  );
};

export default DoughnutChart;
