const InsightSkeleton = () => {
  return (
    <main className="px-5 md:px-10 py-8">
      {/* Heading */}
      <div className="w-52 h-[50px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg mb-2"></div>
      <div className="w-full max-w-2xl h-[35px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg mb-10"></div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 bg-[rgb(var(--color-skeleton-bg))] animate-pulse p-4 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full  bg-[rgb(var(--color-skeleton-bg-deep))] animate-pulse"></div>
              <div className="w-20 h-5 rounded-sm bg-[rgb(var(--color-skeleton-bg-deep))] animate-pulse"></div>
            </div>
            <div className="w-full h-10  bg-[rgb(var(--color-skeleton-bg-deep))] animate-pulse rounded-sm"></div>
            <div className="w-10/12 h-5  bg-[rgb(var(--color-skeleton-bg-deep))] animate-pulse rounded-sm"></div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default InsightSkeleton;
