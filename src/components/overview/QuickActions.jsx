import { FiPlus, FiTarget, FiDownload } from "react-icons/fi";
import { useModalContext } from "../../context/ModalContext";
import { useOverviewContext } from "../../context/OverviewContext";
import { useState } from "react";
import clsx from "clsx";

const QuickActions = () => {
  const { handleCSVExport, handlePDFExport } = useOverviewContext();
  const { onOpenModal } = useModalContext();
  const [openExport, setOpenExport] = useState(false);

  const exportCSV = () => {
    handleCSVExport();
    setOpenExport(false);
  };

  const exportPDF = () => {
    handlePDFExport();
    setOpenExport(false);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
      <p className="text-sm text-[rgb(var(--color-muted))]">
        Take control of your finances with just one click.
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-between gap-4 mt-10">
        <button
          onClick={() => onOpenModal("transactions", "add")}
          className="bg-green-600 hover:bg-green-700  text-white text-xs font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        <button
          onClick={() => onOpenModal("budgets")}
          className="bg-indigo-600 hover:bg-indigo-700  text-white text-xs font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiTarget className="w-4 h-4" />
          <span>Set Budget</span>
        </button>

        <button
          onClick={() => onOpenModal("goals")}
          className="bg-indigo-600 hover:bg-indigo-700  text-white text-xs font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiTarget className="w-4 h-4" />
          <span>Set Goal</span>
        </button>

        <div className="w-fit h-fit relative">
          <div
            className={clsx(
              "absolute bottom-[95%] left-2/5 bg-[rgb(var(--color-gray-bg-settings))] text-[13px] text-[rgb(var(--color-muted))] font-medium rounded overflow-hidden shadow z-60 flex-col",
              openExport ? "flex" : "hidden"
            )}
          >
            <button
              onClick={exportCSV}
              type="button"
              className="px-5 py-1.5 cursor-pointer hover:bg-[rgb(var(--color-brand))] hover:text-white transition"
            >
              As CSV
            </button>
            <button
              onClick={exportPDF}
              type="button"
              className="px-5 py-1.5 cursor-pointer hover:bg-[rgb(var(--color-brand))] hover:text-white transition"
            >
              As PDF
            </button>
          </div>
          <button
            onClick={() => setOpenExport((prev) => !prev)}
            className="bg-gray-700 hover:bg-gray-800  text-white text-xs font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export Financial Log</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickActions;
