import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { updateDocument } from "../firebase/firestore";

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
              history.push(formatInsightHistory({ data, expired }));

              if (data.status !== "EXPIRED") {
                await updateDocument(uid, "insights", document.id, {status: "EXPIRED"});
              }
            } else {
              const activeInsight = { id: document.id, ...data, status: "ACTIVE" };

              history.push(formatInsightHistory({ data: activeInsight, expired }));
              list.push(activeInsight);
            }
          }

          set({ insights: list, insightsHistory: history });
        });
      },

      clearInsightsStore: () => set({ insights: [], insightsHistory: [] }),
    }),
    {
      name: "insights-storage",
      partialize: (state) => ({ insights: state.insights }),
    }
  )
);

const formatInsightHistory = ({ data, expired }) => {
  const type = normalizeHistoryType(data.type);
  const status = expired || data.status === "EXPIRED" ? "EXPIRED" : "ACTIVE";
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
