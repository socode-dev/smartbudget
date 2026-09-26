const InsightSkeleton = () => (
  <div
    className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    role="status"
    aria-label="Loading insights"
  >
    <span className="sr-only">Loading insights...</span>
    <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
      <div className="space-y-3">
        <div className="h-9 w-48 rounded bg-[rgb(var(--color-skeleton-bg))]" />
        <div className="h-4 w-full max-w-sm rounded bg-[rgb(var(--color-skeleton-bg))]" />
      </div>
      <div className="h-11 w-64 max-w-full rounded-md bg-[rgb(var(--color-skeleton-bg))]" />
      <div className="mt-8 grid gap-4">
        {Array.from(
          {
            length: 3,
          },
          (_, index) => (
            <div
              key={index}
              className="grid min-w-0 grid-cols-1 gap-5 rounded-xl border border-border bg-card p-5 min-[1100px]:grid-cols-[minmax(0,1fr)_20rem]"
            >
              <div className="min-w-0 space-y-4">
                <div className="h-6 w-2/3 rounded bg-[rgb(var(--color-skeleton-bg))]" />
                <div className="h-16 w-full rounded bg-[rgb(var(--color-skeleton-bg))]" />
                <div className="h-3 w-1/2 rounded bg-[rgb(var(--color-skeleton-bg))]" />
              </div>
              <div className="min-w-0 rounded-lg border border-border bg-surface p-4 [&>h3]:text-[11px] [&>h3]:uppercase space-y-4">
                <div className="h-4 w-1/2 rounded bg-[rgb(var(--color-skeleton-bg))]" />
                <div className="h-12 w-full rounded bg-[rgb(var(--color-skeleton-bg))]" />
                <div className="h-11 w-3/4 rounded bg-[rgb(var(--color-skeleton-bg))]" />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  </div>
);
export default InsightSkeleton;
