import { createContext, useContext, useState } from "react";
import {
  deleteDocument,
  getAllDocuments,
  updateDocument,
} from "../firebase/firestore";
import useNotificationStore from "../store/useNotificationStore";
import useAuthStore from "../store/useAuthStore";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const user = useAuthStore((state) => state.currentUser);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );
  const [notificationId, setNotificationId] = useState("");
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);

  const onOpenDialog = async (notification) => {
    if (!notification) return;
    setNotificationId(notification.id);
    const data = {
      ...notification,
      read: true,
    };
    await updateDocument(user?.uid, "notifications", notification.id, data);

    // Refetch all notifications to ensure sync
    const refetchedNotifications = await getAllDocuments(
      user?.uid,
      "notifications"
    );
    setNotifications(refetchedNotifications);

    // Open dialog
    setOpenNotificationDialog(true);
  };

  const onCloseDialog = () => {
    setOpenNotificationDialog((prev) => !prev);
    setTimeout(() => setNotificationId(""), 50);
  };

  const handleDelete = async (id) => {
    await deleteDocument(user?.uid, "notifications", id);

    // Refetch all notifications to ensure sync
    const refetchedNotifications = await getAllDocuments(
      user?.uid,
      "notifications"
    );
    setNotifications(refetchedNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{
        openNotificationDialog,
        notificationId,
        onOpenDialog,
        onCloseDialog,
        handleDelete,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
