export default function TransactionMobileList({
  groups,
  renderAmount,
  formatCategory,
  renderActions,
}) {
  return (
    <div className="md:hidden">
      {groups.map(({ month, transactions }) => (
        <section key={month} aria-label={month}>
          <h3 className="border-y border-border bg-surface px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
            {month}
          </h3>
          <ul>
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="border-b border-border bg-card p-4"
              >
                <div className="grid grid-cols-2 items-start gap-3">
                  <p className="min-w-0 break-words text-sm font-medium">
                    {transaction.description || "No description"}
                  </p>
                  {renderAmount(transaction)}
                </div>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {transaction.date}
                    </p>
                    <span className="inline-block max-w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-foreground wrap-anywhere">
                      {formatCategory(transaction)}
                    </span>
                  </div>
                  {renderActions(transaction)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
