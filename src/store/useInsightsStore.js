import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { addDocument, getAllDocuments } from "../firebase/firestore";
import useCurrencyStore from "./useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";
import { toast } from "react-hot-toast";

const EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;

const useInsightsStore = create(
  persist(
    (set, get) => ({
      insights: [],
      insightError: null,
      aiLimitReached: false,

      setInsightError: (message) => set({insightError: message}),
      setAILimitReached: (bool) => set({aiLimitReached: bool}),

      // Generation lock to prevent multiple simultaneous insight generation
      isGeneratingInsights: false,
      lastGenerationTime: 0,

      // Subscribe to realtime updates and clean expired ones
      initInsights: (uid) => {
        const colRef = collection(db, "users", uid, "insights");

        return onSnapshot(colRef, async (snapshot) => {
          const now = Date.now();
          const list = [];

          for (const document of snapshot.docs) {
            const data = document.data();
            const expired = data.expiresAt && data.expiresAt < now;

            if (expired) {
              // Delete from firestore
              await deleteDoc(doc(db, "users", uid, "insights", document.id));
              continue;
            }
            list.push({ id: document.id, ...data });
          }

          set({ insights: list });
        });
      },

      // Add new insight with expiry (persist all insights to Firestore)
      // addInsight: async (uid, insight) => {
        

      //   const insightWithExpiry = {
      //     ...insight,
      //     expiresAt: Date.now() + EXPIRY_MS,
      //   };

      //   // Optimistic update: show locally immediately
      //   set((state) => ({ insights: [...state.insights, insightWithExpiry] }));

      //   if (!uid) return;

      //   try {
      //     await addDocument(uid, "insights", insightWithExpiry);

      //     // Refetch all insights
      //     const docs = await getAllDocuments(uid, "insights");

      //     set({ insights: docs });
      //   } catch (err) {
      //     console.warn("Failed to persist insight to Firestore:", err);
      //   }
      //   // Toast message for new insights
      //   toast.success(
      //     `New insight for ${insightWithExpiry?.category}: Check Insight page for more info.`,
      //     {
      //       duration: 10000,
      //     }
      //   );
      // },

      clearInsightsStore: () => set({ insights: [] }),
    }),
    {
      name: "insights-storage",
      partialize: (state) => ({ insights: state.insights }),
    }
  )
);

export default useInsightsStore;
