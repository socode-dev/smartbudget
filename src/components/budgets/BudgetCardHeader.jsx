import { isValid, format } from "date-fns";
import Button from "../ui/Button";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function BudgetCardHeader({
  name,
  income,
  date,
  handleEditBudget,
  budget,
  deletingId,
  deleteBudget,
}) {

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h2 className="break-words font-display text-base font-semibold">
          {name}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {income ? "Income target" : "Expense limit"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isValid(date) ? format(date, "MMMM yyyy") : "Period unavailable"}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5">
        <Button
          variant="ghost"
          className="size-11 min-h-11 shrink-0 p-0!"
          title="Edit budget"
          aria-haspopup="dialog"
          aria-label={`Edit ${name} budget`}
          onClick={() => handleEditBudget(budget.id)}
          disabled={deletingId === budget.id}
        >
          <FiEdit2 aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          className="size-11 min-h-11 shrink-0 p-0! text-danger"
          title="Delete budget"
          aria-label={`Delete ${name} budget`}
          onClick={() => deleteBudget(budget.id)}
          disabled={deletingId !== null}
        >
          <FiTrash2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
