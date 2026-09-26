import InsightCard from "./InsightCard";
import Pagination from "../ui/Pagination";
import { FiZap } from "react-icons/fi";

export default function ActiveInsightList({
  activeView,
  sortedInsights,
  paginatedInsights,
  currentPage,
  totalPages,
  setPage,
}) {

  return (
    <section
      id="insights-panel-active"
      role="tabpanel"
      aria-labelledby="insights-tab-active"
      hidden={activeView !== "active"}
      tabIndex={0}
    >
      {activeView === "active" &&
        (sortedInsights.length ? (
          <>
            <div id="insights-grid" className="mt-8 grid gap-4">
              {paginatedInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>

            <Pagination
              label="Active insights pagination"
              page={currentPage}
              pages={totalPages}
              onPageChange={setPage}
              count={`${sortedInsights.length} active insights`}
            />
          </>
        ) : (
          <div
            id="insights-empty-state"
            className="flex min-h-80 flex-col items-center justify-center gap-4 px-4 py-8 text-center"
          >
            <span className="grid size-12 place-items-center rounded-lg bg-info-soft text-2xl text-primary">
              <FiZap aria-hidden="true" />
            </span>

            <h2 className="font-display text-xl font-semibold">
              No active insights
            </h2>

            <p className="max-w-md text-sm text-muted-foreground">
              Nothing to show right now. Vydra will generate insights as
              your data grows.
            </p>
          </div>
        ))}
    </section>
  );
}
