import { useMemo } from "react";
import { useReportContext } from "../../context/ReportContext";

const Table = () => {
  const { reportTableData, currencySymbol } = useReportContext();

  const tableData = useMemo(() => reportTableData(), [reportTableData]);
  console.log(tableData);

  return (
    <>
      {/* Desktop view */}
      <table className="hidden md:table min-w-full divide-y divide-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] rounded-lg shadow-sm p-4 overflow-hidden text-xs">
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
        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-gray-border))] text-[12px]">
          {tableData.map((data, i) => (
            <tr key={i}>
              <td className="p-2.5">{data.category}</td>
              <td className="p-2.5">{data.amount}</td>
              <td className="p-2.5">{data.percentage}</td>
              <td className="p-2.5">{data.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile view */}
      <div className="md:hidden w-full max-w-3xl grid grid-cols-1 xs:grid-cols-2  gap-4">
        {tableData.map((data) => (
          <div
            key={data.category}
            className="bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-gray-border))] text-[rgb(var(--color-muted))] shadow rounded p-4"
          >
            <h3 className="text-lg font-semibold ">{data.category}</h3>
            <div className="mt-3">
              <p className="text-xs">
                <span>Amount Spent: </span>
                <strong className="text-sm">{data.amount}</strong>
              </p>

              <p className="text-xs">
                <span>% of Total: </span>
                <strong className="text-sm">{data.percentage}</strong>
              </p>

              <p className="text-xs">
                <span>Transactions: </span>
                <strong className="text-sm">{data.count}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Table;
