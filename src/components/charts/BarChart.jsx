import { Bar } from "react-chartjs-2";
import { getBarChartData, barChartOptions } from "./chartConfig/barChart";
import useTransactionStore from "../../store/useTransactionStore";
import { useEffect, useMemo, useRef } from "react";

const BarChart = () => {
  const chartRef = useRef(null);
  const { transactions, currencySymbol } = useTransactionStore();

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current?.chart?.destroy();
      }
    };
  }, []);

  // Data for the chart
  const data = useMemo(() => getBarChartData(transactions), [transactions]);
  const options = useMemo(
    () => barChartOptions(currencySymbol),
    [currencySymbol]
  );

  return <Bar ref={chartRef} data={data} options={options} height={700} />;
};

export default BarChart;
