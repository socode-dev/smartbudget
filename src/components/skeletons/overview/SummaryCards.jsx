const SummaryCardSkeleton = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-8">
      <div className="w-full h-[150px] animate-pulse rounded-lg bg-[rgb(var(--color-skeleton-bg))]"></div>
      <div className="w-full h-[150px] animate-pulse rounded-lg bg-[rgb(var(--color-skeleton-bg))]"></div>
      <div className="w-full h-[150px] animate-pulse rounded-lg bg-[rgb(var(--color-skeleton-bg))]"></div>
      <div className="w-full h-[150px] animate-pulse rounded-lg bg-[rgb(var(--color-skeleton-bg))]"></div>
    </section>
  );
};

export default SummaryCardSkeleton;
