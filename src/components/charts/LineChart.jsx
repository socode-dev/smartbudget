import { Line } from "react-chartjs-2";
import { useEffect, useRef } from "react";
import { useOverviewChartContext } from "../../context/OverviewChartContext";
import { div } from "@tensorflow/tfjs";

const LineChart = () => {
  const chartRef = useRef(null);
  const { incomeVsExpensesData, incomeVsExpensesOptions } =
    useOverviewChartContext();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-68">
      <Line
        ref={chartRef}
        data={incomeVsExpensesData}
        options={incomeVsExpensesOptions}
      />
    </div>
  );
};

export default LineChart;
