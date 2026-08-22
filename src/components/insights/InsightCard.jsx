import clsx from "clsx";
import {FaLightbulb} from "react-icons/fa6"
import useAuthStore from "../../store/useAuthStore";
import { markInsightViewed } from "../../utils/insightTelemetry";
import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner"
import toast from "react-hot-toast";
import { color } from "./pillColor";
import { respondToInsight } from "../../api/respondToInsight";

const isTerminalInsight = (insight) => {
    return ["ACKNOWLEDGED", "DISMISSED", "EXPIRED"].includes(insight?.status);
};

const InsightCard = ({ insight, surface = "insights_page" }) => {
  const user = useAuthStore(state => state.currentUser);
  const [isSavingResponse, setIsSavingResponse] = useState({
    acknowledge: false,
    dismiss: false
  });

  const cardRef = useRef(null);

  useEffect(() => {
    if (!user?.uid || !insight?.id) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        markInsightViewed({userId: user.uid, insight, surface});
      }

    }, { threshold: 0.5 });

    const currentCard = cardRef.current;

    if(currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      observer.disconnect();
    }
  }, [user?.uid, insight, surface]);

  const terminal = isTerminalInsight(insight);

  const onAcknowledge = async () => {
    if (!user?.uid || !insight?.id || terminal) return;
    
    setIsSavingResponse(prev => ({ ...prev, acknowledge: true }));

    try {
      const result = await respondToInsight({ 
        userId: user.uid, 
        insight, 
        response: "ACKNOWLEDGED",
        surface });

      toast.success(result?.success?.message || "Insight acknowledged");
    } catch (err) {
      toast.error(err?.message || "Error acknowledging insight. Please try again")
    } finally {
      setIsSavingResponse(prev => ({ ...prev, acknowledge: false }));
    }

  }

  const onDismiss = async () => {
    if (!user?.uid || !insight?.id || terminal) return;
    
    setIsSavingResponse(prev => ({ ...prev, dismiss: true }));

    try {
      const result = await respondToInsight({ 
        userId: user.uid, 
        insight, 
        response: "DISMISSED",
        surface 
      });

      toast.success(result?.success?.message || "Insight dismissed");
    } catch (err) {
      toast.error(err?.message || "Error dismissing insight. Please try again")
    } finally {
      setIsSavingResponse(prev => ({ ...prev, dismiss: false }));
    }
  }
  
  const { category, month, year, actionText, message, severity } = insight;

  const showActionButtons = !terminal;

  return (
    <div ref={cardRef} aria-live="polite" className={clsx("flex flex-col bg-[rgb(var(--color-bg-card))] shadow-sm border-l-2 rounded-md", color[severity]?.border || color.LOW.border)}>

      <div className="flex items-center gap-3 my-4 px-4 text-sm font-semibold">
        
        <div className={clsx("h-3 min-w-3 rounded-full", color[severity]?.circleBG || color.LOW.circleBG)} />
        
        <p role="status" className="font-semibold">{category}</p>

        <div className="w-1 h-1 bg-[rgb(var(--color-gray-border))] rounded-full" />
      
        <p className="text-xs">{`${month}, ${year}`}</p>
        
        <div className="w-1 h-1 bg-[rgb(var(--color-gray-border))] rounded-full" />
        
        <span role="status" className={clsx("py-1 px-2.5 font-semibold text-[10px] uppercase rounded-full", color[insight.status])}>{insight.status}</span>

        <span role="status" className={clsx("ml-auto py-1 px-2.5 font-semibold text-[10px] uppercase rounded-full", color[severity]?.pill || color.LOW.pill)}>
          {severity || "LOW"}{" "} 
          <span className="max-xs:hidden">RISK</span>
        </span>      
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

      <hr className="border-[rgb(var(--color-gray-border))] w-[95%] mx-auto" />

      {showActionButtons && (
        <div className="my-4 flex items-center self-end gap-2 px-4">
          <button 
            type="button"
            aria-label="acknowledge insight"
            aria-busy={isSavingResponse.acknowledge}
            onClick={onAcknowledge}
            disabled={isSavingResponse.acknowledge || isSavingResponse.dismiss}
            className="rounded-md bg-[rgb(var(--color-brand))] hover:bg[rgb(var(--color-brand-deep))] px-3 py-2 w-34 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
          >
            {isSavingResponse.acknowledge ? <LoadingSpinner size={20} /> : "Acknowledge" }
          </button>

          <button 
            type="button"
            aria-label="dismiss insight"
            aria-busy={isSavingResponse.dismiss}
            onClick={onDismiss}
            disabled={isSavingResponse.dismiss || isSavingResponse.acknowledge}
            className="rounded-md border border-[rgb(var(--color-gray-border))] px-3 py-2 w-20 text-sm font-medium text-[rgb(var(--color-muted))] disabled:opacity-50 cursor-pointer"
          >
            {isSavingResponse.dismiss ? 
                <LoadingSpinner size={20} color="rgb(var(--color-status-bg-blue))" borderTopColor="rgb(var(--color-brand))" /> 
              : 
                "Dismiss"
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightCard;
