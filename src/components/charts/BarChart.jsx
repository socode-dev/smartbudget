import { Bar } from "react-chartjs-2";
import { useEffect, useRef } from "react";
import { useReportChartContext } from "../../context/ReportChartContext";

const BarChart = () => {
  const chartRef = useRef(null);
  const { barChartOptions, barChartData } = useReportChartContext();

  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      chart?.destroy();
    };
  }, []);

  return (
    <div className="relative h-72 min-w-0 w-full">
      <Bar
        ref={chartRef}
        data={barChartData}
        options={barChartOptions}
        role="img"
        aria-label="Expenses by category. Detailed amounts appear in the breakdown table."
      />
    </div>
  );
};

export default BarChart;
