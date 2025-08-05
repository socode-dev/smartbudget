import React from "react";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import BarChart from "../components/charts/BarChart";
import DoughnutChart from "../components/charts/DoughnutChart";
import Table from "../components/reports/Table";
import { useReportContext } from "../context/ReportContext";
import ScrollToTop from "../layout/ScrollToTop";

const Reports = () => {
  const { expenses, handleCSVExport, handlePDFExport } = useReportContext();

  return (
    <main className="py-10">
      <ScrollToTop />
      <h2 className="text-2xl font-semibold mb-2">Reports</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] mb-10">
        Review, analyze, and export your financial history.
      </p>

      {/* Charts */}
      {expenses.length > 0 ? (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending over time */}
            <figure className="flex flex-col gap-4 bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Spending Over Time</h3>

              {/* Bar Chart */}
              <BarChart />
            </figure>

            {/* Category Breakdown */}
            <figure className="flex flex-col gap-4 bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Category Breakdown</h3>

              {/* Doughnut Chart */}
              <DoughnutChart page="reports" />
            </figure>
          </section>

          <section className="my-8">
            <Table />
          </section>

          {/* Export */}
          <section className="flex justify-end mt-10 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <button
              onClick={handleCSVExport}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-green-200 bg-green-50 hover:bg-green-100 transition text-green-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
            >
              <FaFileCsv className="w-5 h-5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handlePDFExport}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-red-200 bg-red-50 hover:bg-red-100 transition text-red-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer"
            >
              <FaFilePdf className="w-5 h-5" />
              <span>PDF</span>
            </button>
          </section>
        </>
      ) : (
        <p className="text-[rgb(var(--color-muted))] text-center text-lg">
          Oops, no reports to show yet. <br /> Add some expenses to unlock your
          spending insights!.
        </p>
      )}
    </main>
  );
};

export default Reports;
