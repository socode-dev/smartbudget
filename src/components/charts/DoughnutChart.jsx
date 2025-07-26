import { useEffect, useMemo, useRef } from "react";
import useTransactionStore from "../../store/useTransactionStore";
import { Doughnut } from "react-chartjs-2";
import {
  getDoughnutChartData,
  doughnutChartOptions,
} from "./chartConfig/doughnutChart";

const DoughnutChart = () => {
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
  const doughnutData = useMemo(
    () => getDoughnutChartData(transactions),
    [transactions]
  );
  const options = useMemo(
    () => doughnutChartOptions(currencySymbol),
    [currencySymbol]
  );

  return <Doughnut ref={chartRef} data={doughnutData} options={options} />;
};

export default DoughnutChart;
