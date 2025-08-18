import { createContext, useContext, useRef, useState } from "react";
import { useDropdownClose } from "../hooks/useDropdownClose";
import { useAuthContext } from "./AuthContext";
import {
  addDocument,
  deleteDocument,
  getAllDocuments,
  updateDocument,
} from "../firebase/firestore";
import useNotificationStore from "../store/useNotificationStore";
import toast from "react-hot-toast";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { serverTimestamp } from "firebase/firestore";

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

  useDropdownClose(
    openNotificationDropdown,
    notificationRef,
    setOpenNotificationDropdown
  );

  const onOpenDropdown = () => setOpenNotificationDropdown((prev) => !prev);

  const onCloseDropdown = () => setOpenNotificationDropdown(false);

  const onOpenDialog = async (id, subject, message, type) => {
    setNotificationId(id);
    onCloseDropdown();
    // update notification read true
    const data = {
      subject: subject,
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

  const resendVerificationLink = async () => {
    await sendEmailVerification(auth.currentUser, {
      url: "http://localhost:5173/email-verified",
      handleCodeInApp: true,
    });

    const notification = {
      subject: "A new email verification link has been sent",
      message:
        "We've just sent a fresh verification link to your email address. Please check your inbox, and if you don't see it there within a few minutes, don't forget to look in your spam or junk folder.",
      type: "System",
      read: false,
      createdAt: serverTimestamp(),
    };

    await addDocument(currentUser.uid, "notifications", notification);
    toast.success(
      "Verification link has been sent your email. Check your inbox or spam folder.",
      { position: "top-center", duration: 5000 }
    );
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
        resendVerificationLink,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
