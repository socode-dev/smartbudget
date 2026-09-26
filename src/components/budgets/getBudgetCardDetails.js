import { parseISO } from "date-fns";

export default function getBudgetCardDetails(budget, warningThreshold) {
  const name = budget.category?.toLowerCase() === "other" 
    ? budget.name || budget.category
    : budget.category || budget.name;

  const limit = Number(budget.amount);
  const validLimit = Number.isFinite(limit) && limit > 0;
  const income = budget.type === "income";
  const percent = validLimit ? (budget.activity / limit) * 100 : 0;
  const over = validLimit && budget.activity > limit;
  const atLimit = validLimit && budget.activity === limit;
  const near = validLimit && percent >= warningThreshold;

  let tone;
  switch (true) {
    case !validLimit:
      tone = "warning";
      break;
    case income && percent >= 100:
      tone = "success";
      break;
    case income:
      tone = "primary";
      break;
    case over:
      tone = "danger";
      break;
    case near || atLimit:
      tone = "warning";
      break;
    default:
      tone = "success";
  }

  let status;
  switch (true) {
    case !validLimit:
      status = "Limit unavailable";
      break;
    case income && over:
      status = "Target exceeded";
      break;
    case income && atLimit:
      status = "Target reached";
      break;
    case income:
      status = "In progress";
      break;
    case over:
      status = "Over limit";
      break;
    case atLimit:
      status = "Limit reached";
      break;
    case near:
      status = "Close to limit";
      break;
    default:
      status = "On track";
  }
  
  const date = parseISO(budget.date || "");
  
  const progress = Math.min(100, Math.max(0, percent));

  return {
    tone,
    name,
    income,
    date,
    validLimit,
    limit,
    progress,
    percent,
    status,
    over,
  };
}
