const GoalSkeleton = () => (
  <div
    className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    role="status"
    aria-label="Loading goals"
  >
    <span className="sr-only">Loading goals...</span>
    <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-sm space-y-3">
          <div className="h-9 w-28 rounded-md bg-[rgb(var(--color-skeleton-bg))]" />
          <div className="h-4 w-full rounded bg-[rgb(var(--color-skeleton-bg))]" />
        </div>
        <div className="h-11 w-28 rounded-md bg-[rgb(var(--color-skeleton-bg))]" />
      </div>
      <div className="h-11 w-full max-w-md rounded-md bg-[rgb(var(--color-skeleton-bg))]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 min-[1280px]:grid-cols-3">
        {Array.from(
          {
            length: 3,
          },
          (_, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col gap-6 rounded-lg border border-border bg-card p-5"
            >
              <div className="h-5 w-3/5 rounded bg-[rgb(var(--color-skeleton-bg))]" />
              <div className="flex items-center gap-5">
                <div className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-full bg-[rgb(var(--color-skeleton-bg))]" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-6 w-full rounded bg-[rgb(var(--color-skeleton-bg))]" />
                  <div className="h-3 w-3/4 rounded bg-[rgb(var(--color-skeleton-bg))]" />
                </div>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <div className="h-6 w-20 rounded bg-[rgb(var(--color-skeleton-bg))]" />
                <div className="h-11 w-36 rounded-md bg-[rgb(var(--color-skeleton-bg))]" />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  </div>
);
export default GoalSkeleton;
