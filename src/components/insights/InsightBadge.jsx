import clsx from "clsx";
import {
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { LuShieldAlert } from "react-icons/lu";
import { titleCase } from "./insightPresentation";

const InsightBadge = ({ value, severity = false }) => {
  const normalized = value?.toUpperCase();
  const danger = severity && ["HIGH", "CRITICAL"].includes(normalized);
  const warning = severity ? normalized === "MEDIUM" : normalized === "ACTIVE";
  const primary = severity ? !danger && !warning : normalized === "ACKNOWLEDGED";

  const Icon = severity
    ? danger
      ? LuShieldAlert
      : warning
        ? FiAlertTriangle
        : FiInfo
    : ["ACTIVE", "ACKNOWLEDGED"].includes(normalized)
      ? FiCheckCircle
      : FiClock;

  return (
    <span
      className={clsx(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs leading-4 font-medium wrap-anywhere",
        {
          "border-danger/15 bg-danger-soft text-danger": danger,
          "border-warning/15 bg-warning-soft text-warning": warning,
          "border-primary/15 bg-info-soft text-primary": primary,
          "border-border bg-secondary text-muted-foreground":
            !danger && !warning && !primary,
        },
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {value ? `${titleCase(value)}${severity ? " risk" : ""}` : "N/A"}
    </span>
  );
};

export default InsightBadge;
