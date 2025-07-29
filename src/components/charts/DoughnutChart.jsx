import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { useReportContext } from "../../context/ReportContext";

const DoughnutChart = () => {
  const chartRef = useRef(null);
  const { doughnutChartData, doughnutChartOptions } = useReportContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  return (
    <Doughnut
      ref={chartRef}
      data={doughnutChartData}
      options={doughnutChartOptions}
    />
  );
};

export default DoughnutChart;
