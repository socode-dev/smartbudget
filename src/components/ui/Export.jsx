import clsx from "clsx";

const Export = ({ isExportOpen, exportCSV, exportPDF }) => {
  return (
    <div
      role="button"
      className={clsx(
        "absolute bottom-12 left-0 bg-[rgb(var(--color-gray-bg-settings))] text-sm text-[rgb(var(--color-muted))] rounded overflow-hidden shadow-2xl z-60 flex-col items-center w-full border-2 border-[rgb(var(--color-gray-border))]",
        isExportOpen ? "flex" : "hidden"
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
  );
};

export default Export;
