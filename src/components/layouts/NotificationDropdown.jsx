const NotificationDropdown = ({ open }) => {
  if (!open) return null;
  return (
    <div className="absolute top-8 -right-10 mt-2 w-max p-4 bg-[rgb(var(--color-gray-bg-settings))] border border-[rgb(var(--color-gray-border))] rounded-lg shadow-lg z-60 text-xs font-medium flex flex-col items-center justify-center py-6">
      <span className="text-[rgb(var(--color-muted))]">
        No new notification
      </span>
    </div>
  );
};

export default NotificationDropdown;
