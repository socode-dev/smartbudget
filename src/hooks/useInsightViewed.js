import { useEffect, useRef } from "react";
import useAuthStore from "../store/useAuthStore";
import { useDemoMode } from "../demo/useDemoMode";
import { markInsightViewed } from "../utils/insightTelemetry";

const useInsightViewed = (insight, surface) => {
  const cardRef = useRef(null);
  const userId = useAuthStore((state) => state.currentUser?.uid);
  const isDemoMode = useDemoMode();

  useEffect(() => {
    if (isDemoMode || !userId || !insight?.id) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          markInsightViewed({
            userId,
            insight,
            surface,
          });
      },
      {
        threshold: 0.5,
      },
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [userId, insight, surface, isDemoMode]);

  return cardRef;
};

export default useInsightViewed;
