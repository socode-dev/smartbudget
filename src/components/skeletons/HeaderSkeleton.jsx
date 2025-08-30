const HeaderSkeleton = () => {
  return (
    <div className="h-16 lg:relative fixed top-0 left-0 w-full bg-[rgb(var(--color-bg))] shadow flex items-center py-3 px-4 lg:px-6 z-50">
      {/* Left: Hamburger for mobile */}
      <div className="flex items-center gap-2">
        <div className="lg:hidden mr-2 p-2 w-7 h-7 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
      </div>

      <div className="grow">
        <div className=" ml-4 w-32 h-6 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
      </div>

      {/* Right: Icons and User Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification Icon with new notification counts(if there is any) */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"
          ></div>
        ))}

        <div className="w-10 h-8 bg-[rgb(var(--color-skeleton-bg))] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default HeaderSkeleton;
