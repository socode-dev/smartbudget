import SummaryCards from "../components/overview/SummayCards";
import Charts from "../components/overview/Charts";
import SmartInsight from "../components/overview/SmartInsight";
import BudgetOverview from "../components/overview/BudgetOverview";
import QuickActions from "../components/overview/QuickActions";

const Overview = () => {
  return (
    <main className="flex flex-col gap-16 pb-8">
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 mt-4">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[rgb(var(--color-<h2>Welcome back, Guest</h2>
      text))]"
        >
          Welcome back, Guest
        </h2>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          Here is a quick summary of your financial activity this month. You
          have spent less than usual and your savings are ahead of schedule.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-8">
        <SummaryCards />
      </section>

      <section>
        <Charts />
      </section>

      <section>
        <SmartInsight />
      </section>

      <section>
        <BudgetOverview />
      </section>

      <section>
        <QuickActions />
      </section>
    </main>
  );
};

export default Overview;
