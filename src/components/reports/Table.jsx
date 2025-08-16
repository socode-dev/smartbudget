import { useMemo } from "react";
import { useReportContext } from "../../context/ReportContext";

const Table = () => {
  const { reportTableData } = useReportContext();

  const tableData = useMemo(() => reportTableData(), [reportTableData]);

  return (
    <>
      {/* Desktop view */}
      <table className="hidden md:table min-w-full divide-y divide-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] rounded-lg shadow-sm p-4 overflow-hidden text-sm">
        <thead className="bg-[rgb(var(--color-bg-card))]">
          <tr>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Category
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Amount Spent
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              % of Total
            </th>
            <th className="text-left text-[rgb(var(--color-muted))] p-2">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-gray-border))] text-[13px]">
          {tableData.map((data) => (
            <tr key={data.No}>
              <td className="p-2.5">{data.Category}</td>
              <td className="p-2.5">{data.Amount}</td>
              <td className="p-2.5">{data.Percentage}</td>
              <td className="p-2.5">{data.Count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile view */}
      <div className="md:hidden w-full max-w-3xl grid grid-cols-1 xs:grid-cols-2  gap-4">
        {tableData.map((data) => (
          <div
            key={data.No}
            className="bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-gray-border))] shadow rounded p-4"
          >
            <h3 className="text-lg font-semibold ">{data.Category}</h3>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-[rgb(var(--color-muted))] font-medium">
                <span>Amount Spent: </span>
                <strong className="text-sm">{data.Amount}</strong>
              </p>

              <p className="text-sm text-[rgb(var(--color-muted))] font-medium">
                <span>% of Total: </span>
                <strong className="text-sm">{data.Percentage}</strong>
              </p>

              <p className="text-sm text-[rgb(var(--color-muted))] font-medium">
                <span>Transactions: </span>
                <strong className="text-sm">{data.Count}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Table;
