import { createContext, useContext, useState } from "react";
import { updateDocument } from "../firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useNotificationStore from "../store/useNotificationStore";
import useAuthStore from "../store/useAuthStore";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);

  const onOpenDialog = async (notification) => {
    if (!notification) return;
    setSelectedNotification(notification);
    setOpenNotificationDialog(true);
    if (isDemoMode || notification.read || !user?.uid) return;
    const userId = user.uid;
    try {
      const result = await updateDocument(
        userId,
        "notifications",
        notification.id,
        { read: true },
      );
      if (!result?.ok) throw new Error("NOTIFICATION_UPDATE_FAILED");
      if (useAuthStore.getState().currentUser?.uid !== userId) return;
      useNotificationStore.setState((state) => ({
        notifications: state.notifications.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      }));
    } catch {
      toast.error(
        "This notification could not be marked as read. Please try again.",
      );
    }
  };

  const onCloseDialog = () => setOpenNotificationDialog(false);
  const onDialogClosed = () => {
    if (!openNotificationDialog) setSelectedNotification(null);
  };

  const handleDelete = async (id) => {
    if (isDemoMode) {
      showDemoReadOnlyToast();
      return;
    }
    if (!user?.uid) return;
    const userId = user.uid;
    try {
      await deleteDoc(doc(db, "users", userId, "notifications", id));
      if (useAuthStore.getState().currentUser?.uid !== userId) return;
      useNotificationStore.setState((state) => ({
        notifications: state.notifications.filter((item) => item.id !== id),
      }));
      if (selectedNotification?.id === id) onCloseDialog();
    } catch {
      toast.error("This notification could not be deleted. Please try again.");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        openNotificationDialog,
        notificationId: selectedNotification?.id || "",
        selectedNotification,
        onOpenDialog,
        onCloseDialog,
        onDialogClosed,
        handleDelete,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
