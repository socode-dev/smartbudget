import { useState } from "react";
import { FiBell, FiTrash2 } from "react-icons/fi";
import clsx from "clsx";
import useNotificationStore from "../store/useNotificationStore";
import { useNotificationContext } from "../context/NotificationContext";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import ScrollToTop from "../layout/ScrollToTop";

const PAGE_SIZE = 8;

const timestamp = (value) => {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  return new Date(value || 0).getTime() || 0;
};

const Notifications = () => {
  const storedNotifications = useNotificationStore(state => state.notifications);
  const notifications = storedNotifications || [];
  const { onOpenDialog, handleDelete } = useNotificationContext();
  const [page, setPage] = useState(1);
  const [deletingIds, setDeletingIds] = useState([]);
  
  const sorted = [...notifications].sort(
    (a, b) => timestamp(b.createdAt) - timestamp(a.createdAt),
  );
  
  const unread = notifications.filter(notification => !notification.read).length;
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const recent = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  
  const remove = async (id) => {
    setDeletingIds((ids) => [...ids, id]);
  
    try {
      await handleDelete(id);
    } finally {
      setDeletingIds((ids) => ids.filter((item) => item !== id));
    }
  };
  
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <ScrollToTop />
      <header>
        <h1 className="font-display text-3xl font-semibold">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Updates on your transactions, budgets, and goals.
        </p>
      </header>
      <section
        aria-label="Notifications"
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">
            {currentPage === 1
              ? "Recent notifications"
              : "Earlier notifications"}
          </h2>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {unread} unread
          </span>
        </div>
        {recent.length ? (
          <ul className="divide-y divide-[rgb(var(--color-gray-border))]">
            {recent.map((notification) => (
              <li
                key={notification.id}
                className={clsx(
                  "flex items-start gap-1 pr-2",
                  !notification.read && "bg-info-soft/30",
                )}
              >
                <button
                  type="button"
                  onClick={() => onOpenDialog(notification)}
                  aria-haspopup="dialog"
                  className={clsx(
                    "min-w-0 flex-1 cursor-pointer px-4 py-4 text-left transition-colors hover:bg-surface focus-visible:outline-2",
                    "focus-visible:-outline-offset-2 focus-visible:outline-primary",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      {!notification.read && (
                        <>
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Unread: </span>
                        </>
                      )}
                      <span className="line-clamp-2 break-words">
                        {notification.subject || "Notification"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed break-words text-muted-foreground">
                    {notification.message}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  className="size-11 min-h-11 p-0! mt-3 shrink-0"
                  onClick={() => remove(notification.id)}
                  loading={deletingIds.includes(notification.id)}
                  loadingText={
                    <span className="sr-only">Deleting notification</span>
                  }
                  aria-label={`Delete ${notification.subject || "notification"}`}
                  title="Delete notification"
                >
                  <FiTrash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <FiBell
              size={24}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="text-base font-medium">No notifications yet</h2>
          </div>
        )}
      </section>
      <Pagination
        page={currentPage}
        pages={pages}
        onPageChange={setPage}
        count={`${sorted.length} notifications`}
        label="Notifications pagination"
      />
    </div>
  );
};

export default Notifications;
