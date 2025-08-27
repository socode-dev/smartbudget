const ReportSkeleton = () => {
  return (
    <main className="flex flex-col gap-10 px-5 md:px-10 py-8">
      {/* Heading */}
      <div className="flex flex-col gap-5">
        <div className="w-48 h-[50px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
        <div className="w-full max-w-2xl h-[35px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_) => (
          <div className="h-80 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:hidden">
        {Array.from({ length: 5 }).map((_) => (
          <div className="w-full h-auto p-4 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse">
            <div className="w-32 h-7 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"></div>

            <div className="space-y-2 mt-3">
              {Array.from({ length: 3 }).map((_) => (
                <div className="w-44 h-6 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-auto flex justify-end gap-5">
        <div className="w-16 h-8 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
        <div className="w-16 h-8 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
      </div>
    </main>
  );
};

export default ReportSkeleton;
