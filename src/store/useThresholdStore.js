import { create } from "zustand";
import { getUserThresholds } from "../firebase/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { persist } from "zustand/middleware";

const useThresholdStore = create(
  persist(
    (set) => ({
      thresholds: null,

      setThresholds: (thresholds) => set({ thresholds }),

      loadThresholds: async (userUID) => {
        try {
          const thresholds = await getUserThresholds(userUID);
          set({ thresholds });
        } catch (err) {
          console.error("Error loading notifications:", err);
          toast.error("Failed to load user thresholds. Please try again.");
        } finally {
          return "Loading user thresholds completed";
        }
      },

      updateThresholds: async (userUID, thresholds) => {
        await setDoc(
          doc(db, "users", userUID),
          { thresholds: thresholds },
          { merge: true }
        );

        // Fetch updated thresolds
        const updatedThresholds = await getUserThresholds(userUID);
        set({ thresholds: updatedThresholds });
      },

      clearThresholdStore: () => {
        set({ thresholds: null });
      },
    }),
    {
      name: "thresholds-storage",
      partialize: (state) => ({
        thresholds: state.thresholds,
      }),
    }
  )
);

export default useThresholdStore;
