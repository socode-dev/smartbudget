import clsx from "clsx";
import { useReportContext } from "../../context/ReportContext";
import { useReportChartContext } from "../../context/ReportChartContext";
import useCurrencyStore from "../../store/useCurrencyStore";
import { formatAmount } from "../../utils/formatAmount";

const Table = () => {
  const { totalExpenses, expenses } = useReportContext();
  const { categories } = useReportChartContext();
  const currency = useCurrencyStore((state) => state.selectedCurrency);

  const share = (row) => (
    <div className="flex items-center gap-2 text-xs tabular-nums">
      <span
        className="block h-1.5 min-w-6 w-20 overflow-hidden rounded bg-border [&>span]:block [&>span]:h-full [&>span]:rounded-[inherit]"
        aria-hidden="true"
      >
        <span
          style={{
            width: `${Math.min(100, Math.max(0, row.percentage))}%`,
            backgroundColor: row.color,
          }}
        />
      </span>
      <span className="shrink-0 whitespace-nowrap">
        {row.percentage.toFixed(1)}%
      </span>
    </div>
  );

  const name = (row) => (
    <span className="inline-flex min-w-0 items-baseline gap-2 wrap-anywhere">
      <span
        className="inline-block size-2.5 shrink-0 rounded-xs"
        style={{
          backgroundColor: row.color,
        }}
        aria-hidden="true"
      />
      {row.category}
    </span>
  );

  return (
    <div className="overflow-x-scroll rounded-b-xl">
      <table
        className={clsx(
          "w-full min-w-[600px] table-fixed border-collapse bg-card text-sm [&_th]:border-b [&_th]:border-border [&_th]:px-4",
          "[&_th]:py-3.5 [&_th]:text-left [&_th]:wrap-anywhere [&_td]:border-b [&_td]:border-border [&_td]:px-4 [&_td]:py-3.5",
          "[&_td]:text-left [&_td]:wrap-anywhere [&_thead]:bg-surface [&_thead]:text-xs [&_thead]:text-muted-foreground",
          "[&_tbody_tr:hover]:bg-surface [&_tfoot]:bg-surface [&_tfoot]:font-semibold",
        )}
      >
        <caption className="sr-only">Expense totals by category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>

            <th scope="col" className="text-right! tabular-nums">
              Amount spent
            </th>

            <th scope="col">% of total</th>

            <th scope="col" className="text-right! tabular-nums">
              Count
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map((row) => (
            <tr key={row.category}>
              <th scope="row" className="font-medium">
                {name(row)}
              </th>

              <td className="text-right! tabular-nums">
                {formatAmount(row.amount, currency)}
              </td>

              <td>{share(row)}</td>

              <td className="text-right! tabular-nums">{row.count}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td className="text-right! tabular-nums">
              {formatAmount(totalExpenses, currency)}
            </td>
            <td>{totalExpenses > 0 ? "100%" : "0%"}</td>
            <td className="text-right! tabular-nums">{expenses.length}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
export default Table;
