import SummaryCards from "../components/overview/SummayCards";
import Charts from "../components/overview/Charts";
import SmartInsight from "../components/overview/SmartInsight";
import BudgetOverview from "../components/overview/BudgetOverview";
import QuickActions from "../components/overview/QuickActions";
import ScrollToTop from "../layout/ScrollToTop";
import { useAuthContext } from "../context/AuthContext";

const Overview = () => {
  const { userName } = useAuthContext();

  return (
    <main className="flex flex-col gap-16 px-5 md:px-10 py-8">
      <ScrollToTop />
      <div className="flex flex-col gap-5">
        <h2 className="text-3xl md:text-4xl font-semibold text-[rgb(var(--color-text))]">
          Welcome,{" "}
          <span className="text-[rgb(var(--color-brand-deep))]">
            {userName.fullName}
          </span>
        </h2>
        <p className="text-base text-[rgb(var(--color-muted))]">
          Here is a quick summary of your financial activity this month.
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
