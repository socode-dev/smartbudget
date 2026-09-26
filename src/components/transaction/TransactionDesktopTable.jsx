import clsx from "clsx";

export default function TransactionDesktopTable({
  groups,
  formatCategory,
  renderAmount,
  renderActions,
}) {

  return (
    <table
      className={clsx(
        "w-full min-w-[760px] table-fixed border-collapse bg-card text-sm [&_th]:border-b [&_th]:border-border [&_th]:px-4",
        "[&_th]:py-3.5 [&_th]:align-middle [&_th]:wrap-anywhere [&_td]:border-b [&_td]:border-border [&_td]:px-4 [&_td]:py-3.5",
        "[&_td]:align-middle [&_td]:wrap-anywhere [&_thead_th]:bg-surface [&_thead_th]:text-left [&_thead_th]:text-xs",
        "[&_thead_th]:font-medium [&_thead_th]:text-muted-foreground [&_tbody_tr:hover]:bg-surface",
      )}
    >
      <caption className="sr-only">Transactions grouped by month</caption>
      <colgroup>
        <col className="w-[120px]" />
        <col />
        <col className="w-40" />
        <col className="w-[190px]" />
        <col className="w-28" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Description</th>
          <th scope="col">Category</th>
          <th scope="col" className="text-right">
            Amount
          </th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      {groups.map(({ month, transactions }) => (
        <tbody key={month}>
          <tr className="[&>th]:bg-surface [&>th]:py-2.5! [&>th]:text-left [&>th]:text-xs [&>th]:font-semibold [&>th]:text-muted-foreground">
            <th colSpan={5} scope="rowgroup">
              {month}
            </th>
          </tr>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="text-xs text-muted-foreground tabular-nums">
                {transaction.date}
              </td>
              <td className="font-medium">
                {transaction.description || "No description"}
              </td>
              <td>
                <span className="inline-block max-w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-foreground wrap-anywhere">
                  {formatCategory(transaction)}
                </span>
              </td>
              <td className="text-right">{renderAmount(transaction)}</td>
              <td>{renderActions(transaction)}</td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}
