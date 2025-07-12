const NotificationDropdown = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-60 text-xs font-medium flex flex-col items-center justify-center py-6">
      <span className="text-gray-500">No new notification</span>
    </div>
  );
};

export default NotificationDropdown;
