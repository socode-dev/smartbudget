import { create } from "zustand";
import { getAllDocuments } from "../firebase/firestore";

const useNotificationStore = create((set) => ({
  notifications: [],
  selectedNotification: null,
  isOpen: false,

  setNotifications: (notifications) => set({ notifications }),
  openNotification: (notif) =>
    set({ selectedNotification: notif, isOpen: true }),
  closeNotification: () => set({ selectedNotification: null, isOpen: false }),

  loadNotifications: async (userUID) => {
    try {
      const notifs = await getAllDocuments(userUID, "notifications");
      set({ notifications: notifs });
    } catch (err) {
      console.error("Error loading notifications:", err);
      toast.error("Failed to load notifications. Please try again.");
    } finally {
      return "Loading notifications completed";
    }
  },
}));

export default useNotificationStore;
