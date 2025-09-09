import { FaLightbulb } from "react-icons/fa6";
import { FiTrendingUp, FiAlertTriangle } from "react-icons/fi";

export const insightUIMap = {
  tip: {
    icon: FaLightbulb,
    color: "text-blue-500 bg-[rgb(var(--color-bg-status-blue))]",
    label: "Tip",
  },
  suggestion: {
    icon: FiAlertTriangle,
    color: "text-amber-500 bg-[rgb(var(--color-bg-status-amber))]",
    label: "Suggestion",
  },
  forecast: {
    icon: FiTrendingUp,
    color: "text-green-500 bg-[rgb(var9--color-bg-status-green)]",
    label: "Forecast",
  },
};
