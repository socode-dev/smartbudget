import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { useReportChartContext } from "../../context/ReportChartContext";
import { useOverviewChartContext } from "../../context/OverviewChartContext";
import clsx from "clsx";

const DoughnutChart = ({ page }) => {
  const chartRef = useRef(null);
  const reportContext = useReportChartContext();
  const overviewContext = useOverviewChartContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
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

  return (
    <div
      className={clsx(
        "grow w-full flex flex-col items-center",
        page === "overview" ? "h-68" : "h-80"
      )}
    >
      <Doughnut ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
