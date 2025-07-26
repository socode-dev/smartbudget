import React from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import BarChart from "../components/charts/BarChart";
import DoughnutChart from "../components/charts/DoughnutChart";

const Reports = () => {
  return (
    <main className="py-10">
      <h2 className="text-2xl font-semibold mb-2">Reports</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mb-10">
        Review, analyze, and export your financial history.
      </p>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending over time */}
        <div className="flex flex-col gap-4 bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Spending Over Time</h3>

          {/* Bar Chart */}
          <div className="grow w-full h-76 overflow-y-auto">
            <BarChart />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="flex flex-col gap-4 bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Category Breakdown</h3>

          {/* Pie Chart */}
          <div className="grow w-full h-68">
            <DoughnutChart />
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end mt-10 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-green-200 bg-green-50 hover:bg-green-100 transition text-green-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer">
          <FaFileCsv className="w-5 h-5" />
          <span>CSV</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-red-200 bg-red-50 hover:bg-red-100 transition text-red-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer">
          <FaFilePdf className="w-5 h-5" />
          <span>PDF</span>
        </button>
      </div>
    </main>
  );
};

export default Reports;
