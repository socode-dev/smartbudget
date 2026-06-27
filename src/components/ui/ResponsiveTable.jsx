import clsx from "clsx";

const ResponsiveTable = ({
  columns = [],
  rows = [],
  getRowKey,
  emptyMessage = "No records found.",
  mobileRow,
  className,
  tableClassName,
}) => {
  const renderCell = (column, row) => {
    if (typeof column.render === "function") return column.render(row);
    return row?.[column.key] ?? "";
  };

  return (
    <div className={className}>
      <div
        className={clsx(
          "hidden overflow-x-auto rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] md:block",
          tableClassName
        )}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[rgb(var(--color-gray-bg))] text-left text-[rgb(var(--color-muted))]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx("px-4 py-3 font-semibold", column.headerClassName)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-t border-[rgb(var(--color-gray-border))]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx("px-4 py-3", column.cellClassName)}
                  >
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {!rows.length && (
          <p className="px-4 py-10 text-center text-[rgb(var(--color-muted))]">
            {emptyMessage}
          </p>
        )}
      </div>

      <div className="space-y-4 md:hidden">
        {rows.map((row, index) => (
          <div
            key={getRowKey(row, index)}
            className="rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] p-4"
          >
            {typeof mobileRow === "function" ? (
              mobileRow(row, { columns, renderCell })
            ) : (
              <dl className="grid gap-3 text-sm">
                {columns
                  .filter((column) => !column.hideOnMobile)
                  .map((column) => (
                    <div
                      key={column.key}
                      className="flex items-start justify-between gap-4"
                    >
                      <dt className="text-[rgb(var(--color-muted))]">
                        {column.header}
                      </dt>
                      <dd className="text-right font-medium">
                        {renderCell(column, row)}
                      </dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>
        ))}

        {!rows.length && (
          <p className="rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] px-4 py-10 text-center text-[rgb(var(--color-muted))]">
            {emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResponsiveTable;
