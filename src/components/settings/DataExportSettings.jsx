import Button from "../ui/Button";
import { FiDownload } from "react-icons/fi";

export default function DataExportSettings({ transactions, exportData }) {

  return (
    <section
      className="min-w-0 bg-surface border border-border rounded-xl py-5 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_p]:text-xs"
      aria-labelledby="settings-data-heading"
    >
      <header className="px-4 pb-5 border-b border-border">
        <h2 id="settings-data-heading">Your data</h2>
        <p>Everything Vydra holds is exportable at any time</p>
      </header>

      <div className="grid min-w-0 gap-5 px-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>Export transactions hsitory as a single archive. CSV opens in any spreadsheet; PDF keeps the full transactions in table structure.</p>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!transactions.length}
              onClick={() => exportData("csv")}
            >
              <span className="flex items-center gap-2">
                <FiDownload aria-hidden="true" />
                Export CSV
              </span>
            </Button>

            <Button
              variant="outline"
              disabled={!transactions.length}
              onClick={() => exportData("pdf")}
            >
              <span className="flex items-center gap-2">
                <FiDownload aria-hidden="true" />
                Export PDF
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
