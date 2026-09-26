import clsx from "clsx";
import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

const icons = {
  error: FiAlertCircle,
  success: FiCheckCircle,
  info: FiInfo,
};

const Alert = ({ children, tone = "error", className, ...props }) => {
  const Icon = icons[tone] || FiInfo;
  return (
    <div
      {...props}
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "flex items-start gap-2.5 rounded-md border border-current p-3 text-sm leading-normal",
        {
          "bg-danger-soft text-danger": tone === "error",
          "bg-info-soft text-primary": tone === "info",
          "bg-success-soft text-success": tone === "success",
        },
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
};

export default Alert;
