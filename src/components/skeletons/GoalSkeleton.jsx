const GoalSkeleton = () => {
  return (
    <main className="flex flex-col gap-10 px-5 md:px-10 py-8">
      {/* Heading */}
      <div className="flex flex-col gap-5">
        <div className="w-48 h-[50px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
        <div className="w-full h-[35px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
      </div>

      <div className="h-12 col-span-full sm:col-span-4 md:col-span-full xl:col-span-3 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-[rgb(var(--color-skeleton-bg))] h-auto w-full rounded-lg p-4"
          >
            <div className=" flex justify-between items-start gap-4">
              <div className="flex flex-col grow h-full space-y-1.5">
                <div className="h-7 w-40 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse mb-4"></div>

                {/* Budget summary */}
                <div className="grow w-full space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-44 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"
                    ></div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="w-16 h-16 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-full animate-pulse "></div>

                <div className="h-4 w-48 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"></div>
              </div>

              <div className="flex gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse"
                  ></div>
                ))}
              </div>
            </div>

            <div className="w-full h-10 bg-[rgb(var(--color-skeleton-bg-deep))] rounded-md animate-pulse mt-4"></div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default GoalSkeleton;
