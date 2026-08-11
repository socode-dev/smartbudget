import clsx from "clsx";
import {FaLightbulb} from "react-icons/fa6"

const InsightCard = ({ insight }) => {
  
  const { category, month, year, actionText, message, severity } = insight;

  const severityColor = {
    LOW: {
      circleBG: "bg-blue-500",
      pill: "bg-[rgb(var(--color-status-bg-blue))] text-blue-500",
      border: "border-blue-500"
    },
    MEDIUM: {
      circleBG: "bg-amber-400",
      pill: "bg-[rgb(var(--color-status-bg-amber))] text-amber-500",
      border: "border-amber-400"
    },
    HIGH: {
      circleBG: "bg-red-500",
      pill: "bg-[rgb(var(--color-status-bg-red))] text-red-500",
      border: "border-red-500"
    }
  }

  return (
    <div aria-live="polite" className={clsx("flex flex-col bg-[rgb(var(--color-bg-card))] shadow-sm border-l-4 rounded-md", severityColor[severity]?.border || severityColor.LOW.border)}>

      <div className="flex items-center gap-3 my-4 px-4 text-sm font-semibold">
        
        <div className={clsx("h-4 min-w-4 rounded-full", severityColor[severity]?.circleBG || severityColor.LOW.circleBG)} />
        
        <abbr className="font-semibold">{category}</abbr>
          <div className="w-1 h-1 bg-[rgb(var(--color-gray-border))] rounded-full" />
        <abbr>{`${month}, ${year}`}</abbr>
        
          <abbr className={clsx("ml-auto py-1 px-2.5 font-semibold text-xs uppercase rounded-full", severityColor[severity]?.pill || severityColor.LOW.pill)}>
            {severity || "LOW"} <span className="max-xs:hidden">RISK</span></abbr>      
      </div>

      <hr className="border-[rgb(var(--color-gray-border))] w-[95%] mx-auto" />

      <p className="grow text-sm text-[rgb(var(--color-muted))] px-12 py-3 my-3 leading-relaxed">{message}</p>

      <hr className="border-[rgb(var(--color-gray-border))] w-[95%] mx-auto" />

      <p className="text-sm text-[rgb(var(--color-muted))] bg-[rgb(--color-gray-bg)] flex items-start gap-4 pl-4 pr-8 py-3 overflow-hidden">
        <span className="w-10 h-10 text-yellow-300/80">
        <FaLightbulb aria-hidden="true" size={18} />
        </span>
        <span>{actionText}</span>
      </p>
    </div>
  );
};

export default InsightCard;
