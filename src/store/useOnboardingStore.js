import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOnboardingStore = create(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      tourActive: false,
      currentPage: "overview",
      currentTourUserId: null,
      completedTours: [],
      completedToursByUser: {},
      completedOnboardingUsers: [],
      tourEnabledUsers: [],

      setOnboardingCompleted: (userId = null) => {
        const { completedOnboardingUsers } = get();

        set({
          hasCompletedOnboarding: true,
          completedOnboardingUsers:
            userId && !completedOnboardingUsers.includes(userId)
              ? [...completedOnboardingUsers, userId]
              : completedOnboardingUsers,
        });
      },

      enableTourForUser: (userId = null) => {
        const { tourEnabledUsers, setOnboardingCompleted } = get();

        setOnboardingCompleted(userId);

        if (userId && !tourEnabledUsers.includes(userId)) {
          set({ tourEnabledUsers: [...tourEnabledUsers, userId] });
        }
      },

      disableTourForUser: (userId = null) => {
        if (!userId) return;

        set((state) => ({
          tourEnabledUsers: state.tourEnabledUsers.filter((id) => id !== userId),
          tourActive: false,
          currentTourUserId: null,
        }));
      },

      hasSeenWelcome: (userId = null) => {
        const { hasCompletedOnboarding, completedOnboardingUsers } = get();
        if (!userId) return hasCompletedOnboarding;

        return (
          completedOnboardingUsers.includes(userId) ||
          (hasCompletedOnboarding && completedOnboardingUsers.length === 0)
        );
      },

      hasTourEnabled: (userId = null) => {
        const { tourEnabledUsers } = get();
        return Boolean(userId && tourEnabledUsers.includes(userId));
      },

      // Start tour for specific page
      startTour: (page = null, userId = null) => {
        const currentPage = page || get().currentPage;
        set({
          tourActive: true,
          currentPage: currentPage,
          currentTourUserId: userId,
        });
      },

      // Stop current tour
      stopTour: () => {
        const {
          currentPage,
          currentTourUserId,
          completedTours,
          completedToursByUser,
        } = get();
        const userTours = currentTourUserId
          ? completedToursByUser[currentTourUserId] || []
          : completedTours;

        set({
          tourActive: false,
          currentTourUserId: null,
          completedTours: completedTours.includes(currentPage)
            ? completedTours
            : [...completedTours, currentPage],
          completedToursByUser: currentTourUserId
            ? {
                ...completedToursByUser,
                [currentTourUserId]: userTours.includes(currentPage)
                  ? userTours
                  : [...userTours, currentPage],
              }
            : completedToursByUser,
        });
      },

      // Set current page (for tracking which page user is on)
      setCurrentPage: (page) => set({ currentPage: page }),

      // Check if tour for a specific page has been completed
      isTourCompleted: (page, userId = null) => {
        const { completedTours, completedToursByUser } = get();
        if (userId) {
          return Boolean(completedToursByUser[userId]?.includes(page));
        }

        return completedTours.includes(page);
      },

      // Start tour for a page if not completed
      startTourIfNotCompleted: (page, userId = null) => {
        const { hasTourEnabled, isTourCompleted, startTour } = get();
        if (hasTourEnabled(userId) && !isTourCompleted(page, userId)) {
          startTour(page, userId);
        }
      },

      // Reset all tours (for testing or user preference)
      resetTours: () =>
        set({
          completedTours: [],
          completedToursByUser: {},
          tourActive: false,
          hasCompletedOnboarding: false,
          currentPage: "overview",
          currentTourUserId: null,
          completedOnboardingUsers: [],
          tourEnabledUsers: [],
        }),

      // Get current tour page
      getCurrentTourPage: () => get().currentPage,
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        completedTours: state.completedTours,
        completedToursByUser: state.completedToursByUser,
        completedOnboardingUsers: state.completedOnboardingUsers,
        tourEnabledUsers: state.tourEnabledUsers,
      }),
    }
  )
);

export default useOnboardingStore;
