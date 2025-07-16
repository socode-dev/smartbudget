import React from "react";
import BarChart from "../components/reports/BarChart";
import PieChart from "../components/reports/PieChart";
import { FaFileCsv, FaFilePdf, FaFileCode } from "react-icons/fa";

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
        <div className="flex flex-col bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Spending Over Time</h3>

          {/* Bar Chart */}
          <div className="grow w-full h-68">
            <BarChart />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="flex flex-col bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Category Breakdown</h3>

          {/* Pie Chart */}
          <div className="grow w-full h-68">
            <PieChart />
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end flex-wrap mt-10 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-green-200 bg-green-50 hover:bg-green-100 transition text-green-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer">
          <span className="bg-green-100 p-2 rounded-full flex items-center justify-center">
            <FaFileCsv className="w-5 h-5" />
          </span>
          <span>CSV</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-red-200 bg-red-50 hover:bg-red-100 transition text-red-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer">
          <span className="bg-red-100 p-2 rounded-full flex items-center justify-center">
            <FaFilePdf className="w-5 h-5" />
          </span>
          <span>PDF</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-blue-200 bg-blue-50 hover:bg-blue-100 transition text-blue-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer">
          <span className="bg-blue-100 p-2 rounded-full flex items-center justify-center">
            <FaFileCode className="w-5 h-5" />
          </span>
          <span>JSON</span>
        </button>
      </div>
    </main>
  );
};

export default Reports;
