import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
export default function getGoalCardDetails(goal, getAmountSaved) {
  const target = Number(goal.amount);
  const saved = getAmountSaved(goal.categoryKey);

  const validTarget = Number.isFinite(target) && target > 0;
  const progress = validTarget ? (saved / target) * 100 : 0;
  const achieved = validTarget && saved >= target;
  const dueDate = parseISO(goal.date || "");
  const daysLeft = isValid(dueDate)
    ? differenceInCalendarDays(dueDate, new Date())
    : null;
  const overdue = !achieved && daysLeft !== null && daysLeft < 0;

  const tone = achieved ? "success" : overdue ? "warning" : "primary";

  let status;
  switch (true) {
    case achieved:
      status = "Achieved";
      break;
    case daysLeft === null:
      status = "No due date";
      break;
    case daysLeft < 0:
      status = "Past due";
      break;
    case daysLeft === 0:
      status = "Due today";
      break;
    default:
      status = `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
  }

          return {
    tone,
    progress,
    validTarget,
    saved,
    target,
    achieved,
    status,
    dueDate,
  };
}
