const TransactionSkeleton = () => {
  return (
    <main className="flex flex-col gap-10 px-5 md:px-10 py-8">
      {/* Heading */}
      <div className="flex flex-col gap-5">
        <div className="w-56 h-[50px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
        <div className="w-full h-[35px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-8 items-center gap-3 md:gap-5 mb-6">
        {/* Search by Note */}
        <div className="h-12 col-span-full sm:col-span-4 md:col-span-full xl:col-span-3 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>

        {/* Date Range */}
        <div className="w-full h-auto col-span-full sm:col-span-4 md:col-span-4 xl:col-span-3 flex gap-2">
          {/* From Date */}
          <div className="w-1/2 h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>

          {/* To Date */}
          <div className="w-1/2 h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
        </div>
        {/* Category Filter */}
        <select className="h-12 col-span-4 md:col-span-2 xl:col-span-1 rounded-lg bg-[rgb(var(--color-skeleton-bg))] animate-pulse"></select>

        {/* Type Filter */}
        <div className="h-12 col-span-4 md:col-span-2 xl:col-span-1 rounded-lg bg-[rgb(var(--color-skeleton-bg))] animate-pulse"></div>
      </div>

      <section>
        <div className="w-3xs h-10 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-6"></div>
        {/* Table */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-14 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </section>

      {/* Pagination coontrols */}
      <section className="flex justify-between">
        <div className="w-14 h-6 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
        <div className="w-24 h-6 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
        <div className="w-14 h-6 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"
          ></div>
        ))}
      </section>
    </main>
  );
};

export default TransactionSkeleton;
