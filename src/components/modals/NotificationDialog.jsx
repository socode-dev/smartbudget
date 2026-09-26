import { FiBell, FiX } from "react-icons/fi";
import { useNotificationContext } from "../../context/NotificationContext";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";

const NotificationDialog = () => {
  const {
    onCloseDialog,
    onDialogClosed,
    openNotificationDialog,
    selectedNotification: notification,
  } = useNotificationContext();

  return (
    <Dialog
      open={openNotificationDialog}
      onClose={onCloseDialog}
      onExitComplete={onDialogClosed}
      padded={false}
      ariaLabelledBy="notification-title"
      ariaDescribedBy="notification-message"
    >
      <header className="flex items-start gap-3 border-b border-border px-6 py-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info-soft text-primary">
          <FiBell aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="notification-title"
            className="font-display text-lg font-semibold break-words"
          >
            {notification?.subject || "Notification"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatRelativeTime(notification?.createdAt)}
          </p>
        </div>
        <Button
          variant="ghost"
          className="size-11 min-h-11 p-0! shrink-0"
          onClick={onCloseDialog}
          aria-label="Close notification"
          title="Close notification"
        >
          <FiX aria-hidden="true" />
        </Button>
      </header>
      <p
        id="notification-message"
        className="px-6 py-5 text-sm leading-relaxed whitespace-pre-wrap break-words"
      >
        {notification?.message}
      </p>
      <footer className="flex justify-end border-t border-border bg-surface px-6 py-4">
        <Button onClick={onCloseDialog}>Close</Button>
      </footer>
    </Dialog>
  );
};
export default NotificationDialog;
