import clsx from "clsx";
import { insightUIMap } from "../../utils/insightUIMap";

const InsightCard = ({ insight }) => {
  const { actionType: type, actionText, message, severity } = insight;

  const ui = insightUIMap[type] || insightUIMap.tip;

  const Icon = ui.icon;

  return (
    <div className="flex flex-col gap-4 bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-lg border border-[rgb(var(--color-gray-border))]">
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "flex items-center justify-center p-2 rounded-full",
            ui.color
          )}
        >
          <Icon size={24} />
        </span>
        <span className="font-semibold">{ui.label}</span>
        {severity === "high" && (
          <span className="ml-auto text-red-500 font-medium">High</span>
        )}
      </div>
      <p className="text-base text-[rgb(var(--color-muted))]">{message}</p>
      <p className="text-base text-[rgb(var(--color-muted))] font-medium">
        {actionText}
      </p>
    </div>
  );
};

export default InsightCard;
