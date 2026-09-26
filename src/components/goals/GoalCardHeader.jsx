import Button from "../ui/Button";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function GoalCardHeader({
  goal,
  deletingId,
  handleEditGoal,
  deleteGoal,
}) {

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h2 className="break-words font-display text-base font-semibold">
          {goal.name}
        </h2>

        {goal.description && (
          <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
            {goal.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-0.5">
        <Button
          variant="ghost"
          className="size-11 min-h-11 shrink-0 p-0!"
          title="Edit goal"
          aria-label={`Edit goal: ${goal.name}`}
          aria-haspopup="dialog"
          disabled={deletingId === goal.id}
          onClick={() => handleEditGoal(goal.id)}
        >
          <FiEdit2 aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          className="size-11 min-h-11 shrink-0 p-0! text-danger"
          title="Delete goal"
          aria-label={`Delete goal: ${goal.name}`}
          disabled={deletingId !== null}
          onClick={() => deleteGoal(goal)}
        >
          <FiTrash2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
