import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { updateDocument } from "../firebase/firestore";
import { trackBusinessEvent } from "../api/businessTelemetry";

const hasTerminalResponse = (status) => {
  return ["ACKNOWLEDGED", "DISMISSED", "EXPIRED"].includes(status);
}

const useInsightsStore = create(
  persist(
    (set) => ({
      insights: [],
      insightsHistory: [],
      insightError: null,
      aiLimitReached: false,

      setInsightError: (message) => set({insightError: message}),
      setAILimitReached: (bool) => set({aiLimitReached: bool}),

      initInsights: (uid) => {
        const colRef = collection(db, "users", uid, "insights");

        return onSnapshot(colRef, async (snapshot) => {
          const now = Date.now();
          const list = [];
          const history = [];

          for (const document of snapshot.docs) {
            const data = document.data();
            const expired = data.expiresAt && data.expiresAt < now;

            if (expired) {
              const alreadyTerminal = hasTerminalResponse(data.status);

              history.push(formatInsightHistory({ 
                data: {
                  ...data,
                  status: alreadyTerminal ? data.status : "EXPIRED",
                },
              }));

              await updateDocument(uid, "insights", document.id, {
                valid: false
              });

              if (!alreadyTerminal) {
                await updateDocument(uid, "insights", document.id, {
                  status: "EXPIRED",
                  expiredAtMs: now
                });

                await trackBusinessEvent({
                  userId: uid,
                  eventType: "insight_expired",
                  insightId: document.id,
                  insightType: data.type,
                  severity: data.severity,
                  surface: "insights_store",
                });
              }

              continue;
            }
            
            if (data.valid) {
              const activeInsight = {...data};

              history.push(formatInsightHistory({data: activeInsight}));
              list.push(activeInsight);
            }
          }

          set({ insights: list, insightsHistory: history });
        });
      },

      clearInsightsStore: () => set({ insights: [], insightsHistory: [] }),
    }),
    // {
    //   name: "insights-storage",
    //   partialize: (state) => ({ insights: state.insights }),
    // }
  )
);

const formatInsightHistory = ({ data }) => {
  const type = normalizeHistoryType(data.type);
  const status = data.status;
  const category = ["anomaly", "budget"].includes(type) ? data.category ?? null : null;

  return {
    id: uuid(),
    type,
    status,
    category,
    severity: (data.severity || "LOW").toUpperCase(),
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
  };
};

const normalizeHistoryType = (type) => {
  if (type === "financial-risk") return "risk";
  if (type === "budget-compliance" || type === "budget") return "budget";
  if (type === "cashflow") return "cashflow";
  if (type === "anomaly") return "anomaly";

  return type || "unknown";
};

export default useInsightsStore;
