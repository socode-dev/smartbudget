import { create } from "zustand";
import { getAllDocuments } from "../firebase/firestore";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      selectedNotification: null,
      isOpen: false,

      setNotifications: (notifications) => set({ notifications }),
      openNotification: (notif) =>
        set({ selectedNotification: notif, isOpen: true }),
      closeNotification: () =>
        set({ selectedNotification: null, isOpen: false }),

      loadNotifications: async (userUID) => {
        try {
          const notifs = await getAllDocuments(userUID, "notifications");
          set({ notifications: notifs });
        } catch (err) {
          console.error("Error loading notifications:", err);
          toast.error("Failed to load notifications. Please try again.");
        }
      },

      clearNotificationStore: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "notifications-storage",
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);

export default useNotificationStore;
