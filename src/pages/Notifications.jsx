import clsx from "clsx";
import useNotificationStore from "../store/useNotificationStore";
import { FaTrash } from "react-icons/fa6";
import { useNotificationContext } from "../context/NotificationContext";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";

const NotificationDropdown = () => {
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
    (a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()
  );

  const toggleOptions = (id) =>
    setOptions((prev) => ({ ...prev, id: id, open: !prev.open }));

  const deleteNotification = (id) => {
    setOptions((prev) => ({ ...prev, id: id, open: false }));
    handleDelete(id);
  };

  return (
    <main className="w-full  h-full py-8 flex flex-col">
      <div className="w-full max-w-[600px] mx-auto">
        {notifications?.length > 0 && (
          <>
            {sortedNotification.map((notification) => (
              <div
                key={notification.id}
                className={clsx(
                  "flex items-center gap-5 p-3 bg-[rgb(var(--color-bg-card))] w-full font-medium",
                  !notification.read && "bg-[rgb(var(--color-status-bg-blue))]"
                )}
              >
                <span
                  className={clsx(
                    "w-2.5 h-2 rounded-full",
                    !notification.read && "bg-[rgb(var(--color-brand-deep))]"
                  )}
                ></span>

                <button
                  onClick={() =>
                    onOpenDialog(
                      notification.id,
                      notification.subject,
                      notification.message,
                      notification.type
                    )
                  }
                  className="w-full flex flex-col items-start gap-1 cursor-pointer"
                >
                  <p className="text-xs text-[rgb(var(--color-muted))]">
                    {formatRelativeTime(notification.createdAt)}
                  </p>

                  <p className="text-left truncate w-5/6">
                    {notification.subject}
                  </p>
                </button>

                <div className="relative">
                  <button
                    onClick={() => toggleOptions(notification.id)}
                    className="text-xl text-[rgb(var(--color-muted))] hover:text-gray-700 transition cursor-pointer"
                  >
                    <FiMoreVertical />
                  </button>

                  {options.id === notification.id && options.open && (
                    <div className="absolute right-0 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-2xl">
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
            ))}
          </>
        )}
      </div>
    </main>
  );
};

export default NotificationDropdown;
