import SummaryCardSkeleton from "./SummaryCards";
import Charts from "./Charts";
import BudgetCard from "./BudgetCard";

const OverviewSkeleton = () => {
  return (
    <main className="flex flex-col gap-16 px-5 md:px-10 py-8">
      {/* Heading */}
      <div className="flex flex-col gap-5">
        <div className="w-full max-w-[700px] h-[50px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
        <div className="w-full h-[35px] animate-pulse bg-[rgb(var(--color-skeleton-bg))] rounded-lg"></div>
      </div>

      <SummaryCardSkeleton />

      {/* Chart section */}
      <Charts />

      {/* Smart section */}
      <section>
        <div className="w-2xs h-[40px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-2"></div>
        <div className="w-full max-w-2xl h-[30px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-6"></div>
      </section>

      {/* Budget Overview */}
      <section>
        <div className="w-2xs h-[40px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-2"></div>
        <div className="w-full max-w-2xl h-[30px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-6"></div>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <BudgetCard />
          <BudgetCard />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="w-2xs h-[40px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-2"></div>
        <div className="w-full max-w-2xl h-[30px] bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse mb-6"></div>

        <div className="w-full h-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-between gap-4 ">
          <div className=" h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
          <div className=" h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
          <div className=" h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
          <div className=" h-12 bg-[rgb(var(--color-skeleton-bg))] rounded-lg animate-pulse"></div>
        </div>
      </section>
    </main>
  );
};

export default OverviewSkeleton;
