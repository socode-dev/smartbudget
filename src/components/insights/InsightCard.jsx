import clsx from "clsx";
import {FaLightbulb} from "react-icons/fa6"

const InsightCard = ({ insight }) => {
  
  const { actionType, type, category, month, year, actionText, message, severity } = insight;

  const isHigh = severity === "HIGH";

  const severityColor = {
    LOW: {
      circleBG: "bg-blue-500",
      pill: "bg-blue-100 text-blue-600",
      border: "border-blue-500"
    },
    MEDIUM: {
      circleBG: "bg-amber-400",
      pill: "bg-amber-100 text-amber-600",
      border: "border-amber-400"
    },
    HIGH: {
      circleBG: "bg-red-500",
      pill: "bg-red-100 text-red-600",
      border: "border-red-500"
    }
  }

  return (
    <div className={clsx("flex flex-col bg-[rgb(var(--color-bg-card))] shadow-sm border-l-4 rounded-md", severityColor[severity]?.border || severityColor.LOW.border)}>

      <div className="flex items-center gap-3 my-4 px-4 text-sm font-semibold">
        
        <div className={clsx("h-4 min-w-4 rounded-full", severityColor[severity]?.circleBG || severityColor.LOW.circleBG)} />
        
        <abbr className="font-semibold">{category}</abbr>
          <div className="w-1 h-1 bg-[rgb(var(--color-gray-border))] rounded-full" />
        <abbr>{`${month}, ${year}`}</abbr>
        
          <abbr className={clsx("ml-auto py-1 px-2.5 font-semibold text-xs uppercase rounded-full", severityColor[severity]?.pill || severityColor.LOW.pill)}>
            {severity || "LOW"} <span className="max-xs:hidden">RISK</span></abbr>      
      </div>

      <hr className="border-[rgb(var(--color-gray-border))] w-[95%] mx-auto" />

      <p className="h-fit text-sm text-[rgb(var(--color-muted))] px-12 py-3 my-3 leading-relaxed">{message}</p>

      <hr className="border-[rgb(var(--color-gray-border))] w-[95%] mx-auto" />

      <p className="text-sm text-[rgb(var(--color-muted))] bg-gray-50 flex items-start gap-4 pl-4 pr-8 py-3 overflow-hidden">
        <FaLightbulb size={30} className="text-yellow-300/80" />
        <span>{actionText}</span>
      </p>
    </div>
  );
};

export default InsightCard;
