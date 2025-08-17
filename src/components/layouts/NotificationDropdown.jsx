import clsx from "clsx";
import useNotificationStore from "../../store/useNotificationStore";
import { FaTrash } from "react-icons/fa6";
import { useNotificationContext } from "../../context/NotificationContext";

const NotificationDropdown = () => {
  const { notifications } = useNotificationStore();
  const { onOpenDialog, openNotificationDropdown, handleDelete } =
    useNotificationContext();
  console.log(notifications);

  if (!openNotificationDropdown) return null;

  return (
    <div className="absolute top-15 -right-20 w-[300px] p-4 bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-xs font-medium flex flex-col items-center justify-center gap-2 py-6">
      {notifications?.length ? (
        <>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                "flex justify-between items-center gap-5 p-4 bg-[rgb(var(--color-gray-bg))] rounded w-full",
                !notification?.read && "bg-[rgb(var(--color-status-bg-green))]"
              )}
            >
              <button
                onClick={() =>
                  onOpenDialog(
                    notification.id,
                    notification.title,
                    notification.message,
                    notification.type
                  )
                }
                className="w-10/12 flex items-center gap-5 cursor-pointer"
              >
                <span
                  className={clsx(
                    "w-2 h-2 rounded-full bg-[rgb(var(--color-muted))]",
                    !notification?.read && "bg-green-600"
                  )}
                ></span>
                <p className="text-sm truncate w-full">{notification?.title}</p>
              </button>

              <button
                onClick={() => handleDelete(notification.id)}
                className="text-sm text-red-600 hover:text-red-700 transition cursor-pointer"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </>
      ) : (
        <p className="text-[rgb(var(--color-muted))] text-sm">
          You have no new notification
        </p>
      )}
    </div>
  );
};

export default NotificationDropdown;
