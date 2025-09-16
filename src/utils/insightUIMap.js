import { FaCircleInfo } from "react-icons/fa6";
import { FiTrendingUp } from "react-icons/fi";
import { MdOutlineError } from "react-icons/md";

export const insightUIMap = {
  info: {
    icon: FaCircleInfo,
    color: "text-blue-500",
    label: "Info",
  },
  anomaly: {
    icon: MdOutlineError,
    color: "text-red-500",
    label: "Anomaly",
  },
  forecast: {
    icon: FiTrendingUp,
    color: "text-green-500",
    label: "Forecast",
  },
};
