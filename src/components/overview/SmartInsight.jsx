import InsightCard from "../insights/InsightCard";
import useInsightsStore from "../../store/useInsightsStore";
import {normalizeInsight} from "../../utils/normalizeInsight";
import clsx from "clsx";

const SmartInsight = () => {
  const insights = useInsightsStore((state) => state.insights);

  const normalizedinsights = insights?.map(ins => normalizeInsight(ins));

  const sortedInsights = normalizedinsights
    ?.sort((a, b) => a.createdAt - b.createdAt)
    ?.slice(0, 2);


  return (
    <>
      <h2 className="text-3xl font-medium mb-2">Smart Insights</h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-6">
        Get personalized tips, forecast, and savings suggestions.
      </p>

      {!insights.length && (
        <p className="h-36 flex items-center justify-center text-lg text-[rgb(var(--color-muted))] text-center">
          Not enough data yet. Insights will be generated as data grows.
        </p>
      )}

      {!!insights.length && (
        <section className={clsx("grid grid-cols-1 gap-6", sortedInsights.length > 1 ? "mdl:grid-cols-2" : "mdl:grid-cols-1")}>
          {sortedInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </section>
      )}
    </>
  );
};

export default SmartInsight;
