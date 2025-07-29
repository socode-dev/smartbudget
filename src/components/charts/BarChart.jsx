import { Bar } from "react-chartjs-2";
// import { getBarChartData, barChartOptions } from "./chartConfig/barChart";
// import useTransactionStore from "../../store/useTransactionStore";
import { useEffect, useRef } from "react";
import { useReportContext } from "../../context/ReportContext";

const BarChart = () => {
  const chartRef = useRef(null);
  const { barChartOptions, barChartData } = useReportContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  return (
    <Bar
      ref={chartRef}
      data={barChartData}
      options={barChartOptions}
      height={700}
    />
  );
};

export default BarChart;
