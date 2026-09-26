import ReportCharts from "../components/reports/ReportCharts";
import { FiFileText, FiGrid, FiPieChart, FiPlus } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";
import Table from "../components/reports/Table";
import { useReportContext } from "../context/ReportContext";
import { useReportChartContext } from "../context/ReportChartContext";
import { useModalContext } from "../context/ModalContext";
import ScrollToTop from "../layout/ScrollToTop";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";
import Button from "../components/ui/Button";

const Reports = () => {
  const isDemoMode = useDemoMode();
  const reducedMotion = useReducedMotion();
  const { expenses, handleCSVExport, handlePDFExport } = useReportContext();
  const { categories } = useReportChartContext();
  const { onOpenModal } = useModalContext();
  
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    >
      <ScrollToTop />

      <header
        id="reports-header"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold">Reports</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review, analyze, and export your financial history.
          </p>
        </div>

        <div id="export-buttons" className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!expenses.length}
            onClick={() =>
              isDemoMode ? showDemoReadOnlyToast() : handleCSVExport()
            }
          >
            <span className="flex items-center gap-2">
              <FiGrid aria-hidden="true" className="text-success" />
              Export CSV
            </span>
          </Button>

          <Button
            variant="outline"
            disabled={!expenses.length}
            onClick={() =>
              isDemoMode ? showDemoReadOnlyToast() : handlePDFExport()
            }
          >
            <span className="flex items-center gap-2">
              <FiFileText aria-hidden="true" className="text-danger" />
              Export PDF
            </span>
          </Button>
        </div>
      </header>

      {expenses.length ? (
        <>
          <ReportCharts categories={categories} />

          <section aria-labelledby="report-breakdown-heading" className="border border-border rounded-xl pt-5">
            <header className="pb-4 px-4 border-b border-border">
              <h2
                id="report-breakdown-heading"
                className="font-display text-base font-semibold"
              >
                Detailed breakdown
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </p>
            </header>

            <Table />
          </section>
        </>
      ) : (
        <section
          id="reports-empty-state"
          className="flex min-h-80 flex-col items-center justify-center gap-4 px-4 py-8 text-center"
        >
          <span className="grid size-12 place-items-center rounded-lg bg-info-soft text-2xl text-primary">
            <FiPieChart aria-hidden="true" />
          </span>
          <h2 className="font-display text-xl font-semibold">No reports yet</h2>
          <p className="text-sm text-muted-foreground">
            Add expenses to see your spending breakdown.
          </p>
          <Button
            aria-haspopup="dialog"
            onClick={() =>
              isDemoMode
                ? showDemoReadOnlyToast()
                : onOpenModal("transactions", "add")
            }
          >
            <span className="flex items-center gap-2">
              <FiPlus aria-hidden="true" />
              Add transaction
            </span>
          </Button>
        </section>
      )}
    </motion.div>
  );
};

export default Reports;
