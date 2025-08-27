const BudgetSkeleton = () => {
  return (
    <main className="flex flex-col gap-10 px-5 md:px-10 py-8">
      {/* Heading */}
      <div className="flex flex-col gap-5">
        <div className="w-48 h-[50px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
        <div className="w-full h-[35px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
      </div>

      <div className="h-12 col-span-full sm:col-span-4 md:col-span-full xl:col-span-3 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 5 }).map((_) => (
          <div className="bg-[rgb(var(--color-skeleton-bg))] h-50 w-full rounded-lg flex justify-between items-start gap-4 p-4">
            <div className="flex flex-col grow h-full space-y-1.5">
              <div className="mb-4">
                <div className="h-7 w-40 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse mb-1"></div>
                <div className="h-5 w-30 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"></div>
              </div>

              {/* Budget summary */}
              <div className="grow w-full space-y-1">
                {Array.from({ length: 3 }).map((_) => (
                  <p className="h-4 w-44 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"></p>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-full animate-pulse "></div>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 2 }).map((_) => (
                <div className="h-6 w-6 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default BudgetSkeleton;
