import clsx from "clsx";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { formatAmount } from "../../utils/formatAmount";

export default function TransactionAmount({ transaction, selectedCurrency }) {
  return (
    <span
      className={clsx(
        "inline-flex max-w-full items-center justify-end gap-1 text-sm font-semibold tabular-nums [&>svg]:shrink-0 [&>span]:min-w-0 [&>span]:wrap-anywhere",
        {
          "text-success": transaction.type === "income",
          "text-danger": transaction.type !== "income",
        },
      )}
    >
      {transaction.type === "income" ? (
        <FiArrowUpRight aria-hidden="true" />
      ) : (
        <FiArrowDownRight aria-hidden="true" />
      )}
      <span>
        {transaction.type === "income" ? "+" : "-"}
        {formatAmount(transaction.amount, selectedCurrency)}
      </span>
    </span>
  );
}
