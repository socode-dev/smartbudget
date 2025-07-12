import InsightCards from "./InsightCards";

const SmartInsight = () => {
  return (
    <>
      <h2 className="text-xl font-medium mb-2">Smart Insights</h2>
      <p className="text-sm text-[rgb(var(--color-muted))] font-medium mb-6">
        Get personalized tips, forecast, and savings suggestions.
      </p>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCards />
      </div>
    </>
  );
};

export default SmartInsight;
