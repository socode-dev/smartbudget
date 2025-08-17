import { createContext, useContext, useRef, useState } from "react";
import { useDropdownClose } from "../hooks/useDropdownClose";
import { useAuthContext } from "./AuthContext";
import {
  deleteDocument,
  getAllDocuments,
  updateDocument,
} from "../firebase/firestore";
import useNotificationStore from "../store/useNotificationStore";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notificationRef = useRef(null);
  const { currentUser } = useAuthContext();
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );
  const [notificationId, setNotificationId] = useState("");
  const [openNotificationDropdown, setOpenNotificationDropdown] =
    useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  // console.log(setNotifications);

  useDropdownClose(
    openNotificationDropdown,
    notificationRef,
    setOpenNotificationDropdown
  );

  const onOpenDropdown = () => setOpenNotificationDropdown((prev) => !prev);

  const onCloseDropdown = () => setOpenNotificationDropdown(false);

  const onOpenDialog = async (id, title, message, type) => {
    setNotificationId(id);
    onCloseDropdown();
    // update notification read true
    const data = {
      title: title,
      message: message,
      type: type,
      read: true,
    };
    await updateDocument(currentUser?.uid, "notifications", id, data);

    // Refetch all notifications to ensure sync
    const refetchedNotifications = await getAllDocuments(
      currentUser?.uid,
      "notifications"
    );
    setNotifications(refetchedNotifications);

    // Open dialog
    setOpenNotificationDialog(true);
  };

  const onCloseDialog = () => {
    setOpenNotificationDialog(false);
    setNotificationId("");
  };

  const handleDelete = async (id) => {
    await deleteDocument(currentUser?.uid, "notifications", id);

    // Refetch all notifications to ensure sync
    const refetchedNotifications = await getAllDocuments(
      currentUser?.uid,
      "notifications"
    );
    setNotifications(refetchedNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationRef,
        openNotificationDropdown,
        openNotificationDialog,
        notificationId,
        onOpenDropdown,
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
