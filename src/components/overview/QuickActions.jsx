import { FiPlus, FiTarget, FiDownload } from "react-icons/fi";
import { useModalContext } from "../../context/ModalContext";
import { useOverviewContext } from "../../context/OverviewContext";
import { useRef, useState } from "react";
import { useDropdownClose } from "../../hooks/useDropdownClose";
import Export from "../ui/Export";

const QuickActions = () => {
  const exportRef = useRef(null);
  const { handleCSVExport, handlePDFExport } = useOverviewContext();
  const { onOpenModal } = useModalContext();
  const [isExportOpen, setIsExportOpen] = useState(false);

  useDropdownClose(isExportOpen, exportRef, setIsExportOpen);

  const handleExportToggle = () => setIsExportOpen((prev) => !prev);

  const exportCSV = () => {
    handleCSVExport();
    setIsExportOpen(false);
  };

  const exportPDF = () => {
    handlePDFExport();
    setIsExportOpen(false);
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
          className="bg-green-600 hover:bg-green-700  text-white text-base  px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiPlus className="text-lg" />
          <span>Add Entry</span>
        </button>

        <button
          onClick={() => onOpenModal("budgets")}
          className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))]  text-white text-base px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiTarget className="text-lg" />
          <span>Set Budget</span>
        </button>

        <button
          onClick={() => onOpenModal("goals")}
          className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))]  text-white text-base px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
        >
          <FiTarget className="text-lg" />
          <span>Set Goal</span>
        </button>

        <div className="relative" ref={exportRef}>
          {/* Export button */}
          <button
            onClick={handleExportToggle}
            className="w-full bg-gray-700 hover:bg-gray-800  text-white text-base px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex justify-center items-center gap-2"
          >
            <FiDownload className="text-lg" />
            <span>Export Log</span>
          </button>

          {/* CSV and PDF button */}
          <Export
            isExportOpen={isExportOpen}
            exportCSV={exportCSV}
            exportPDF={exportPDF}
          />
        </div>
      </div>
    </>
  );
};

export default QuickActions;
