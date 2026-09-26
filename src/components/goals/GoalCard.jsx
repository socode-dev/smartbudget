import getGoalCardDetails from "./getGoalCardDetails";
import GoalCardHeader from "./GoalCardHeader";
import clsx from "clsx";
import Button from "../ui/Button";
import { formatAmount } from "../../utils/formatAmount";
import { FiCheck, FiCalendar, FiPlus } from "react-icons/fi";
import { isValid } from "date-fns";

export default function GoalCard({
  goal,
  deletingId,
  handleEditGoal,
  deleteGoal,
  selectedCurrency,
  handleAddContribution,
  getAmountSaved,
}) {
  const {
    tone,
    progress,
    validTarget,
    saved,
    target,
    achieved,
    status,
    dueDate,
  } = getGoalCardDetails(goal, getAmountSaved);

  return (
    <article
      className={clsx(
        "flex min-w-0 flex-col gap-6 rounded-xl border border-border bg-card p-5",
        {
          "[--sb-accent:var(--primary)] [--sb-soft:var(--info-soft)]":
            tone === "primary",
          "[--sb-accent:var(--success)] [--sb-soft:var(--success-soft)]":
            tone === "success",
          "[--sb-accent:var(--danger)] [--sb-soft:var(--danger-soft)]":
            tone === "danger",
          "[--sb-accent:var(--warning)] [--sb-soft:var(--warning-soft)]":
            tone === "warning",
        },
      )}
    >
      <GoalCardHeader
        goal={goal}
        deletingId={deletingId}
        handleEditGoal={handleEditGoal}
        deleteGoal={deleteGoal}
      />

      <div className="flex items-center gap-5">
        <div
          className={clsx(
            "grid size-18 shrink-0 place-items-center rounded-full",
            "bg-[conic-gradient(var(--sb-accent)_var(--progress),var(--border)_0)] [&>span]:flex [&>span]:size-14",
            "[&>span]:items-center [&>span]:justify-center [&>span]:rounded-full [&>span]:bg-card [&>span]:font-display",
            "[&>span]:font-semibold [&>span]:tabular-nums",
          )}
          style={{
            "--progress": `${Math.min(100, Math.max(0, progress))}%`,
          }}
          role="progressbar"
          aria-label={`Savings progress for ${goal.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.max(0, progress))}
          aria-valuetext={
            validTarget
              ? `${progress.toFixed(0)}% saved`
              : "No valid target amount"
          }
        >
          <span className="p-0.5 text-center text-xs leading-tight wrap-anywhere">
            {validTarget ? `${progress.toFixed(0)}%` : "N/A"}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold tabular-nums wrap-anywhere">
            {formatAmount(saved, selectedCurrency)}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums wrap-anywhere">
            saved of {formatAmount(validTarget ? target : 0, selectedCurrency)}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums wrap-anywhere mt-2">
            {!validTarget
              ? "Target amount unavailable"
              : saved > target
                ? `${formatAmount(saved - target, selectedCurrency)} above target`
                : `${formatAmount(target - saved, selectedCurrency)} to go`}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sb-soft)] px-2 py-1.5 text-xs font-medium text-[var(--sb-accent)]">
            {achieved ? (
              <FiCheck aria-hidden="true" />
            ) : (
              <FiCalendar aria-hidden="true" />
            )}
            {status}
          </span>
          {isValid(dueDate) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Due{" "}
              {dueDate.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          aria-label={`Add contribution to goal: ${goal.name}`}
          aria-haspopup="dialog"
          disabled={deletingId === goal.id}
          onClick={() =>
            handleAddContribution(goal.id, "contributions", goal.name)
          }
        >
          <span className="flex items-center gap-2">
            <FiPlus aria-hidden="true" />
            Add contribution
          </span>
        </Button>
      </div>
    </article>
  );
}
