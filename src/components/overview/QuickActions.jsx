import clsx from "clsx";
import { FiPlus, FiTarget, FiDownload, FiCreditCard } from "react-icons/fi";
import { useRef, useState } from "react";
import { useModalContext } from "../../context/ModalContext";
import { useOverviewContext } from "../../context/OverviewContext";
import { useDropdownClose } from "../../hooks/useDropdownClose";
import { showDemoReadOnlyToast, useDemoMode } from "../../demo/useDemoMode";
import useTransactionStore from "../../store/useTransactionStore";
import Button from "../ui/Button";

const ACTIONS = [
  {
    type: "transactions",
    label: "Add Entry",
    icon: FiPlus,
  },
  {
    type: "budgets",
    label: "Set Budget",
    icon: FiCreditCard,
  },
  {
    type: "goals",
    label: "Set Goal",
    icon: FiTarget,
  },
];

const QuickActions = () => {
  const isDemoMode = useDemoMode();
  const exportRef = useRef(null);
  const { handleCSVExport, handlePDFExport } = useOverviewContext();
  const { onOpenModal } = useModalContext();
  const hasTransactions = useTransactionStore(state => state.transactions.length > 0);
  const [isExportOpen, setIsExportOpen] = useState(false);
  useDropdownClose(isExportOpen, exportRef, setIsExportOpen);
  
  const open = (type) => isDemoMode ? showDemoReadOnlyToast() : onOpenModal(type, "add");
  
  const exportData = (type) => {
    if (isDemoMode) showDemoReadOnlyToast();
    else if (type === "csv") handleCSVExport();
    else handlePDFExport();
    setIsExportOpen(false);
  };
  
  return (
    <>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-base font-semibold">Quick Actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Take control of your finances.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACTIONS.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => open(type)}
            aria-haspopup="dialog"
          >
            <span className="flex items-center gap-2">
              <Icon className="shrink-0 text-primary" aria-hidden="true" />
              {label}
            </span>
          </Button>
        ))}

        <div
          className="relative"
          ref={exportRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsExportOpen(false);
              exportRef.current?.querySelector("button")?.focus();
            }
          }}
        >
          <Button
            variant="outline"
            disabled={!hasTransactions}
            title={!hasTransactions ? "No transactions to export" : undefined}
            aria-expanded={isExportOpen}
            aria-controls="overview-export-options"
            onClick={() => setIsExportOpen((value) => !value)}
            className="w-full"
          >
            <span className="flex items-center gap-2">
              <FiDownload className="shrink-0" aria-hidden="true" />
              Export Log
            </span>
          </Button>

          {isExportOpen && (
            <div
              id="overview-export-options"
              className="absolute bottom-full right-0 z-20 mb-2 w-full min-w-32 rounded-md border border-border bg-card p-1 shadow-lg"
            >
              <button
                type="button"
                className={clsx(
                  "flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left [&:is(button)]:cursor-pointer",
                  "[&:is(button)]:hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
                onClick={() => exportData("csv")}
              >
                As CSV
              </button>
              <button
                type="button"
                className={clsx(
                  "flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left [&:is(button)]:cursor-pointer",
                  "[&:is(button)]:hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
                onClick={() => exportData("pdf")}
              >
                As PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuickActions;
