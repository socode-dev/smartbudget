import clsx from "clsx";

export default function SettingsExportOptions({ exportData }) {

  return (
    <div id="settings-export-options" className="border-t border-border pt-1">
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
  );
}
