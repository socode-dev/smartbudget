import ScrollToTop from "../layout/ScrollToTop";
import useInsightsStore from "../store/useInsightsStore";
import InsightCard from "../components/insights/InsightCard";

const Insights = () => {
  const { insights } = useInsightsStore();

  return (
    <main className="px-5 md:px-10 py-8">
      <ScrollToTop />
      <h2 className="text-3xl md:text-4xl font-semibold mb-2">
        Smart Insights
      </h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-10">
        Personalized suggestions, forecasts and savings tips.
      </p>

      {/* Empty State */}
      {!insights.length && (
        <div className="flex justify-center text-center mt-10">
          <p className="text-lg text-[rgb(var(--color-muted))]">
            Nothing to show right now. <br />
            SmartBudget will generate insights as your data grows.
          </p>
        </div>
      )}

      {/* Smart Insights */}
      {!!insights.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Insights;
