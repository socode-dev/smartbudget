import { useEffect, useMemo, useState } from "react";
import ScrollToTop from "../layout/ScrollToTop";
import useAuthStore from "../store/useAuthStore";
import useInsightsStore from "../store/useInsightsStore";
import InsightCard from "../components/insights/InsightCard";
import InsightHistoryTable from "../components/insights/InsightHistoryTable";
import { motion } from "framer-motion";
import useOnboardingStore from "../store/useOnboardingStore";
import {normalizeInsight} from "../utils/normalizeInsight";

const INSIGHTS_PER_PAGE = 4;

const Insights = () => {
  const isUserEmailVerified = useAuthStore(
    (state) => state.isUserEmailVerified
  );
  const insights = useInsightsStore((state) => state.insights);
  const insightsHistory = useInsightsStore((state) => state.insightsHistory);
  const aiLimitReached = useInsightsStore(state => state.aiLimitReached);
  const [activeView, setActiveView] = useState("insights");
  const [currentPage, setCurrentPage] = useState(1);

  const { setCurrentPage: setOnboardingPage, startTourIfNotCompleted } = useOnboardingStore();

  useEffect(() => {
    setOnboardingPage("insights");
    
    if (!isUserEmailVerified) return;

    const timer = setTimeout(() => {
      startTourIfNotCompleted("insights");
    }, 500);

    return () => clearTimeout(timer);
  }, [setOnboardingPage, startTourIfNotCompleted, isUserEmailVerified]);

  useEffect(() => {
    setCurrentPage(1);
  }, [insights.length]);

  const normalizedinsights = useMemo(
    () => insights?.map(ins => normalizeInsight(ins)) ?? [],
    [insights]
  );

  const sortedInsights = useMemo(
    () => [...normalizedinsights].sort((a, b) => b.createdAt - a.createdAt),
    [normalizedinsights]
  );
  const totalPages = Math.max(1, Math.ceil(sortedInsights.length / INSIGHTS_PER_PAGE));
  const paginatedInsights = sortedInsights.slice(
    (currentPage - 1) * INSIGHTS_PER_PAGE,
    currentPage * INSIGHTS_PER_PAGE
  );

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

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveView("insights")}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            activeView === "insights"
              ? "border-[rgb(var(--color-brand))] bg-[rgb(var(--color-brand))] text-white"
              : "border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text))]"
          }`}
        >
          Active Insights
        </button>
        <button
          type="button"
          onClick={() => setActiveView("history")}
          className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
            activeView === "history"
              ? "border-[rgb(var(--color-brand))] bg-[rgb(var(--color-brand))] text-white"
              : "border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text))]"
          }`}
        >
          History
          <span className="ml-2 rounded-full bg-[rgb(var(--color-gray-bg))] px-2 py-0.5 text-xs text-[rgb(var(--color-muted))]">
            {insightsHistory.length}
          </span>
        </button>
      </div>

      {aiLimitReached && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 flex flex-col gap-2 mb-10">
          
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <p className="text-sm font-semibold text-amber-800">
            AI Insight limit reached
            </p>
          </div>
          
          <p className="text-sm text-amber-700 leading-relaxed">
          You've used all 20 of your free AI insights. You'll still get spending
          alerts below, but without the detailed AI explanation.
          </p>
          
          <button className="self-start text-xs font-semibold text-amber-800
          border border-amber-300 rounded-full px-3 py-1 mt-1
          hover:bg-amber-100 transition">
          Upgrade for more
          </button>
        </div>
      )}

      {activeView === "history" && (
        <InsightHistoryTable histories={insightsHistory} />
      )}

      {activeView === "insights" && !sortedInsights?.length && (
        <div
          id="insights-empty-state"
          className="flex justify-center text-center mt-14"
        >
          <p className="text-lg text-[rgb(var(--color-muted))]">
            Nothing to show right now. <br />
            SmartBudget will generate insights as your data grows.
          </p>
        </div>
      )}


      {activeView === "insights" && !!sortedInsights?.length && (
        <>
          <div
            id="insights-grid"
            className="grid grid-cols-1 mdl:grid-cols-2 gap-6"
          >
            {paginatedInsights?.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-[rgb(var(--color-muted))]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.main>
  );
};

export default Insights;
