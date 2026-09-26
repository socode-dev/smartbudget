import InsightBadge from "./InsightBadge";
import { insightTypeLabel } from "./insightPresentation";
import useInsightViewed from "../../hooks/useInsightViewed";

const InsightPreview = ({ insight }) => {
  const cardRef = useInsightViewed(insight, "overview");

  return (
    <article
      ref={cardRef}
      className="min-w-0 rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <InsightBadge value={insight.severity || "LOW"} severity />
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          {insightTypeLabel(insight.type)}
        </span>
        {insight.category && (
          <span className="text-xs text-muted-foreground">
            {insight.category}
          </span>
        )}
      </div>
      <p
        className="mt-3 line-clamp-3 text-sm leading-relaxed wrap-anywhere"
        title={insight.message}
      >
        {insight.message || "No explanation recorded."}
      </p>
      {insight.actionText && (
        <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm leading-relaxed text-muted-foreground wrap-anywhere">
          {insight.actionText}
        </p>
      )}
    </article>
  );
};

export default InsightPreview;
