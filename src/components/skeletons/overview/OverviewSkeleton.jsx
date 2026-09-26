const Block = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-[rgb(var(--color-skeleton-bg))] ${className}`}
  />
);
const OverviewSkeleton = () => (
  <div
    className="mx-auto min-w-0 w-full max-w-[90rem] space-y-8 px-4 py-8 sm:px-6"
    role="status"
    aria-label="Loading dashboard"
  >
    <div className="space-y-3">
      <Block className="h-4 w-40" />
      <Block className="h-9 w-64 max-w-full" />
      <Block className="h-4 w-96 max-w-full" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1280px]:grid-cols-4">
      {Array.from(
        {
          length: 4,
        },
        (_, index) => (
          <Block key={index} className="h-40" />
        ),
      )}
    </div>
    <div>
      <Block className="mb-5 h-6 w-52" />
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] min-[1280px]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Block className="h-80" />
        <div className="space-y-5">
          {Array.from(
            {
              length: 5,
            },
            (_, index) => (
              <Block key={index} className="h-12" />
            ),
          )}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] min-[1280px]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Block className="h-6 w-40" />
        <Block className="h-48" />
        <Block className="h-48" />
      </div>
      <div className="space-y-4">
        <Block className="h-6 w-48" />
        <Block className="h-36" />
        <Block className="h-36" />
      </div>
    </div>
    <span className="sr-only">Loading dashboard</span>
  </div>
);
export default OverviewSkeleton;
