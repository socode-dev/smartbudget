import { FiPlus, FiTarget, FiDownload } from "react-icons/fi";
import { useModalContext } from "../../context/ModalContext";
import { useOverviewContext } from "../../context/OverviewContext";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useDropdownClose } from "../../hooks/useDropdownClose";

const QuickActions = () => {
  const exportRef = useRef(null);
  const { handleCSVExport, handlePDFExport } = useOverviewContext();
  const { onOpenModal } = useModalContext();
  const [openExport, setOpenExport] = useState(false);

  useDropdownClose(openExport, exportRef, setOpenExport);

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
      <h2 className="text-3xl font-semibold mb-2">Quick Actions</h2>
      <p className="text-base text-[rgb(var(--color-muted))]">
        Take control of your finances with just one click.
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-between gap-4 mt-10">
        <button
          onClick={() => onOpenModal("transactions", "add")}
          className="bg-green-600 hover:bg-green-700  text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiPlus className="text-lg" />
          <span>Add Entry</span>
        </button>

        <button
          onClick={() => onOpenModal("budgets")}
          className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))]  text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiTarget className="text-lg" />
          <span>Set Budget</span>
        </button>

        <button
          onClick={() => onOpenModal("goals")}
          className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))]  text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiTarget className="text-lg" />
          <span>Set Goal</span>
        </button>

        <div className="relative">
          <div
            ref={exportRef}
            role="button"
            className={clsx(
              "absolute bottom-12 left-0 bg-[rgb(var(--color-gray-bg-settings))] text-sm text-[rgb(var(--color-muted))] font-medium rounded overflow-hidden shadow-2xl z-60 flex-col items-center w-full border-2 border-[rgb(var(--color-gray-border))]",
              openExport ? "flex" : "hidden"
            )}
          >
            <button
              onClick={exportCSV}
              type="button"
              className="w-full px-5 py-2.5 cursor-pointer hover:bg-[rgb(var(--color-muted))] hover:text-white transition"
            >
              As CSV
            </button>
            <button
              onClick={exportPDF}
              type="button"
              className="w-full px-5 py-2.5 cursor-pointer hover:bg-[rgb(var(--color-muted))] hover:text-white transition"
            >
              As PDF
            </button>
          </div>
          <button
            onClick={() => setOpenExport((prev) => !prev)}
            className="w-full bg-gray-700 hover:bg-gray-800  text-white text-base font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
          >
            <FiDownload className="text-lg" />
            <span>Export Log</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickActions;
