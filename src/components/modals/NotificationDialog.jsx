import useNotificationStore from "../../store/useNotificationStore";
import { useNotificationContext } from "../../context/NotificationContext";
import { FaXmark } from "react-icons/fa6";
import { motion } from "framer-motion";

const NotificationDialog = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const { onCloseDialog, openNotificationDialog, notificationId } =
    useNotificationContext();

  const notification = notifications?.find(
    (notification) => notification.id === notificationId
  );

  if (!openNotificationDialog && !notification) return;

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-60" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        className="w-full fixed inset-0 flex items-center justify-center z-70 p-4"
      >
        <section className="bg-[rgb(var(--color-bg-card))] w-full sm:w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/6 h-2/3 max-w-md overflow-y-auto p-6 rounded-lg shadow-xl flex flex-col">
          <div className="flex justify-between items-start gap-10">
            <h3 className="text-xl font-semibold">{notification?.subject}</h3>

            <button
              onClick={onCloseDialog}
              className="text-xl text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <FaXmark />
            </button>
          </div>
          <p className="text-base text-[rgb(var(--color-muted))] mt-10 w-full grow">
            {notification?.message}
          </p>

          <button
            onClick={onCloseDialog}
            className="self-end bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] transition text-white font-medium px-4 py-2 rounded cursor-pointer"
          >
            Close
          </button>
        </section>
      </motion.div>
    </>
  );
};

export default NotificationDialog;
