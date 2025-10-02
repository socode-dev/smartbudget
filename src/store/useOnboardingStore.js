import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOnboardingStore = create(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      tourActive: false,
      currentPage: "overview",
      completedTours: [],

      setOnboardingCompleted: () => set({ hasCompletedOnboarding: true }),

      // Start tour for specific page
      startTour: (page = null) => {
        const currentPage = page || get().currentPage;
        set({
          tourActive: true,
          currentPage: currentPage,
        });
      },

      // Stop current tour
      stopTour: () => {
        const { currentPage, completedTours } = get();
        // Mark current page tour as completed
        if (!completedTours.includes(currentPage)) {
          set({
            tourActive: false,
            completedTours: [...completedTours, currentPage],
          });
        } else {
          set({ tourActive: false });
        }
      },

      // Set current page (for tracking which page user is on)
      setCurrentPage: (page) => set({ currentPage: page }),

      // Check if tour for a specific page has been completed
      isTourCompleted: (page) => {
        const { completedTours } = get();
        return completedTours.includes(page);
      },

      // Start tour for a page if not completed
      startTourIfNotCompleted: (page) => {
        const { isTourCompleted, startTour } = get();
        if (!isTourCompleted(page)) {
          startTour(page);
        }
      },

      // Reset all tours (for testing or user preference)
      resetTours: () =>
        set({
          completedTours: [],
          tourActive: false,
          hasCompletedOnboarding: false,
          currentPage: "overview",
        }),

      // Get current tour page
      getCurrentTourPage: () => get().currentPage,
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        completedTours: state.completedTours,
      }),
    }
  )
);

export default useOnboardingStore;
