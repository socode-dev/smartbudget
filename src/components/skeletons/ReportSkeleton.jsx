const ReportSkeleton = () => (
  <div
    className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    role="status"
    aria-label="Loading reports"
  >
    <span className="sr-only">Loading reports...</span>
    <div className="space-y-6 motion-safe:animate-pulse" aria-hidden="true">
      <div className="space-y-3">
        <div className="h-9 w-40 rounded bg-[rgb(var(--color-skeleton-bg))]" />
        <div className="h-4 w-full max-w-sm rounded bg-[rgb(var(--color-skeleton-bg))]" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Array.from(
          {
            length: 2,
          },
          (_, index) => (
            <div
              key={index}
              className="min-w-0 border-t border-border pt-4 [&_figcaption]:mb-6"
            >
              <div className="h-5 w-1/2 rounded bg-[rgb(var(--color-skeleton-bg))]" />
              <div className="h-64 w-full rounded bg-[rgb(var(--color-skeleton-bg))]" />
            </div>
          ),
        )}
      </div>
      <div className="h-6 w-44 rounded bg-[rgb(var(--color-skeleton-bg))]" />
      <div className="space-y-3">
        {Array.from(
          {
            length: 4,
          },
          (_, index) => (
            <div
              key={index}
              className="h-12 w-full rounded bg-[rgb(var(--color-skeleton-bg))]"
            />
          ),
        )}
      </div>
    </div>
  </div>
);
export default ReportSkeleton;
