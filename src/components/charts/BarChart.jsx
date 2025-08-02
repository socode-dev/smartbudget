import { Bar } from "react-chartjs-2";
import { useEffect, useRef } from "react";
import { useReportChartContext } from "../../context/ReportChartContext";

const BarChart = () => {
  const chartRef = useRef(null);
  const { barChartOptions, barChartData } = useReportChartContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-80">
      <Bar
        ref={chartRef}
        data={barChartData}
        options={barChartOptions}
        // height={700}
      />
    </div>
  );
};

export default BarChart;
