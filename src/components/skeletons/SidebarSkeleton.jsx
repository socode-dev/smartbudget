const SidebarSkeleton = () => {
  return (
    <section className="fixed left-0 top-0 w-20 h-svh bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] hidden lg:flex flex-col shadow-lg z-70 p-3">
      {/* Logo */}
      <div className="w-full h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
      {/* Navigation */}
      <div className="w-full flex flex-col grow gap-2 mt-12 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-10 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"
          ></div>
        ))}
      </div>

      {/* User Info */}
      <div className="flex items-center bg-[rgb(var(--color-skeleton-bg))] px-4 rounded-lg py-3 animate-pulse">
        <div className="w-8 h-6 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-full animate-pulse"></div>
      </div>
      {/* </div> */}
    </section>
  );
};

export default SidebarSkeleton;
