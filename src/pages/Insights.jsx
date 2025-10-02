import { useEffect } from "react";
import ScrollToTop from "../layout/ScrollToTop";
import useAuthStore from "../store/useAuthStore";
import useInsightsStore from "../store/useInsightsStore";
import InsightCard from "../components/insights/InsightCard";
import { motion } from "framer-motion";
import useOnboardingStore from "../store/useOnboardingStore";

const Insights = () => {
  const isUserEmailVerified = useAuthStore(
    (state) => state.isUserEmailVerified
  );
  const insights = useInsightsStore((state) => state.insights);

  const { setCurrentPage, startTourIfNotCompleted } = useOnboardingStore();

  useEffect(() => {
    setCurrentPage("insights");
    // Start tour if not completed when navigating to insights page (only if email verified)
    if (!isUserEmailVerified) return;

    const timer = setTimeout(() => {
      startTourIfNotCompleted("insights");
    }, 500);

    return () => clearTimeout(timer);
  }, [setCurrentPage, startTourIfNotCompleted, isUserEmailVerified]);

  if (!isUserEmailVerified) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className=" px-5 md:px-10 py-8 flex justify-center items-center"
      >
        <p className="mt-10 text-xl md:text-2xl text-center text-[rgb(var(--color-muted))]">
          Please verify your email to access this feature.
        </p>
      </motion.main>
    );
  }

  const sortedInsights = insights?.sort((a, b) => a.createdAt - b.createdAt);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="px-5 md:px-10 py-8"
    >
      <ScrollToTop />
      <h2 className="text-3xl md:text-4xl font-semibold mb-2">
        Smart Insights
      </h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-10">
        Personalized suggestions, forecasts and savings tips.
      </p>

      {/* Empty State */}
      {!insights.length && (
        <div
          id="insights-empty-state"
          className="flex justify-center text-center mt-10"
        >
          <p className="text-lg text-[rgb(var(--color-muted))]">
            Nothing to show right now. <br />
            SmartBudget will generate insights as your data grows.
          </p>
        </div>
      )}

      {/* Smart Insights */}
      {!!insights.length && (
        <div
          id="insights-grid"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {sortedInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </motion.main>
  );
};

export default Insights;
