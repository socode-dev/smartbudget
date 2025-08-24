import InsightCards from "./InsightCards";

const SmartInsight = () => {
  return (
    <>
      <h2 className="text-3xl font-medium mb-2">Smart Insights</h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-6">
        Get personalized tips, forecast, and savings suggestions.
      </p>

      <p className="h-36 flex items-center justify-center text-4xl text-[rgb(var(--color-muted))]">
        Coming soon!
      </p>

      {/* Insight Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCards />
      </div> */}
    </>
  );
};

export default SmartInsight;
