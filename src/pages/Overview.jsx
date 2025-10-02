import { useEffect } from "react";
import SummaryCards from "../components/overview/SummayCards";
import Charts from "../components/overview/Charts";
import SmartInsight from "../components/overview/SmartInsight";
import BudgetOverview from "../components/overview/BudgetOverview";
import QuickActions from "../components/overview/QuickActions";
import ScrollToTop from "../layout/ScrollToTop";
import OverviewSkeleton from "../components/skeletons/overview/OverviewSkeleton";
import { useOverviewContext } from "../context/OverviewContext";
import useAuthStore from "../store/useAuthStore";
import { motion } from "framer-motion";
import useOnboardingStore from "../store/useOnboardingStore";

const Overview = () => {
  const user = useAuthStore((state) => state.currentUser);
  const userName = useAuthStore((state) => state.userName);
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    totalBudget,
    totalBudgetUsed,
  } = useOverviewContext;

  const {
    setCurrentPage,
    startTourIfNotCompleted,
    hasCompletedOnboarding,
    tourActive,
  } = useOnboardingStore();

  useEffect(() => {
    setCurrentPage("overview");
    // Start overview tour automatically for new users when they first login
    if (user && hasCompletedOnboarding && tourActive) {
      const timer = setTimeout(() => {
        startTourIfNotCompleted("overview");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [setCurrentPage, startTourIfNotCompleted, user, hasCompletedOnboarding]);

  if (
    !user &&
    !totalIncome &&
    !totalExpenses &&
    !netBalance &&
    !totalBudget &&
    !totalBudgetUsed
  ) {
    return <OverviewSkeleton />;
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-16 px-5 md:px-10 py-8"
    >
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

      <section id="financial-charts">
        <Charts />
      </section>

      <section id="smart-insights">
        <SmartInsight />
      </section>

      <section id="budget-overview">
        <BudgetOverview />
      </section>

      <section id="quick-actions">
        <QuickActions />
      </section>
    </motion.main>
  );
};

export default Overview;
