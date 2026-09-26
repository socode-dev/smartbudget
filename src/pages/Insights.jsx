import InsightVerificationNotice from "../components/insights/InsightVerificationNotice";
import ActiveInsightList from "../components/insights/ActiveInsightList";
import InsightTabs from "../components/insights/InsightTabs";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollToTop from "../layout/ScrollToTop";
import useAuthStore from "../store/useAuthStore";
import useInsightsStore from "../store/useInsightsStore";
import InsightHistoryTable from "../components/insights/InsightHistoryTable";
import { normalizeInsight } from "../utils/normalizeInsight";
import Alert from "../components/ui/Alert";

const INSIGHTS_PER_PAGE = 4;

const Insights = () => {
  const isUserEmailVerified = useAuthStore(state => state.isUserEmailVerified);
  const insights = useInsightsStore((state) => state.insights);
  const insightsHistory = useInsightsStore((state) => state.insightsHistory);
  const aiLimitReached = useInsightsStore((state) => state.aiLimitReached);
  const insightError = useInsightsStore((state) => state.insightError);
  const reducedMotion = useReducedMotion();
  const [activeView, setActiveView] = useState("active");
  const [page, setPage] = useState(1);

  const sortedInsights = useMemo(
    () =>
      insights
        .map(normalizeInsight)
        .filter((insight) => insight.status !== "EXPIRED")
        .sort((a, b) => b.createdAt - a.createdAt),
    [insights],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedInsights.length / INSIGHTS_PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);
  const paginatedInsights = sortedInsights.slice(
    (currentPage - 1) * INSIGHTS_PER_PAGE,
    currentPage * INSIGHTS_PER_PAGE,
  );

  const selectView = (view) => {
    setActiveView(view);
    setPage(1);
  };

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 12,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className={clsx(
        "mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6 [&>header]:border-b [&>header]:border-border",
        "[&>header]:pb-6 [&_[role=tabpanel]]:focus-visible:outline-2 [&_[role=tabpanel]]:focus-visible:outline-ring",
      )}
    >
      <ScrollToTop />
      <header>
        <h1 className="font-display text-3xl font-semibold">Smart Insights</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Personalized suggestions, forecasts and savings tips.
        </p>
      </header>

      {!isUserEmailVerified ? (
        <InsightVerificationNotice />
      ) : (
        <>
          <InsightTabs activeView={activeView} selectView={selectView} />

          {insightError && (
            <Alert tone="info">
              New insights are temporarily unavailable. Previously saved
              insights are still available below.
            </Alert>
          )}
          {aiLimitReached && (
            <Alert tone="info">
              <div>
                <p className="font-semibold">AI insight limit reached</p>
                <p className="mt-1">
                  Spending alerts remain available without detailed AI
                  explanations.
                </p>
              </div>
            </Alert>
          )}

          <ActiveInsightList
            activeView={activeView}
            sortedInsights={sortedInsights}
            paginatedInsights={paginatedInsights}
            currentPage={currentPage}
            totalPages={totalPages}
            setPage={setPage}
          />
          <section
            id="insights-panel-history"
            role="tabpanel"
            aria-labelledby="insights-tab-history"
            hidden={activeView !== "history"}
            tabIndex={0}
          >
            <InsightHistoryTable histories={insightsHistory} />
          </section>
        </>
      )}
    </motion.div>
  );
};

export default Insights;
