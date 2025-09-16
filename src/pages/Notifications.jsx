import clsx from "clsx";
import useNotificationStore from "../store/useNotificationStore";
import { FaTrash } from "react-icons/fa6";
import { useNotificationContext } from "../context/NotificationContext";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";

const Notification = () => {
  const { notifications } = useNotificationStore();
  const { onOpenDialog, handleDelete } = useNotificationContext();
  const [options, setOptions] = useState({
    id: "",
    open: false,
  });

  if (notifications?.length === 0) {
    return (
      <p className="text-[rgb(var(--color-muted))] text-2xl text-center mt-20">
        You have no new notification
      </p>
    );
  }

  const sortedNotification = notifications?.sort(
    (a, b) => b.createdAt - a.createdAt
  );

  const toggleOptions = (id) =>
    setOptions((prev) => ({ ...prev, id: id, open: !prev.open }));

  const deleteNotification = (id) => {
    setOptions((prev) => ({ ...prev, id: id, open: false }));
    handleDelete(id);
  };

  return (
    <main className="w-full max-w-[600px] mx-auto py-8 text-[rgb(var(--color-text))]">
      {notifications?.length > 0 &&
        sortedNotification.map((notification) => {
          return (
            <div
              key={notification.id}
              className={clsx(
                "w-full px-2 py-4 flex items-center bg-[rgb(var(--color-bg-card))]",
                !notification.read && "bg-[rgb(var(--color-status-bg-blue))]"
              )}
            >
              <div
                className={clsx(
                  "w-[8px] h-[8px] rounded-full",
                  !notification.read && "bg-[rgb(var(--color-brand-deep))]"
                )}
              ></div>
              <button
                onClick={() =>
                  onOpenDialog(
                    notification.id,
                    notification.subject,
                    notification.message,
                    notification.type
                  )
                }
                className="w-full px-4 py-1 flex flex-col items-start gap-1 cursor-pointer"
              >
                <p className="text-xs text-[rgb(var(--color-muted))]">
                  {formatRelativeTime(notification.createdAt)}
                </p>

                <p className="truncate w-fit max-w-[300px]">
                  {notification.subject}
                </p>
              </button>

              <div className="relative flex items-center">
                <button
                  onClick={() => toggleOptions(notification.id)}
                  className="text-xl text-[rgb(var(--color-muted))] hover:text-gray-700 transition cursor-pointer"
                >
                  <FiMoreVertical />
                </button>

                {options.id === notification.id && options.open && (
                  <div className="absolute top-7 right-0 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-2xl">
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="px-4 py-2 hover:bg-[rgb(var(--color-bg))] text-sm transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </main>
  );
};

export default Notification;
