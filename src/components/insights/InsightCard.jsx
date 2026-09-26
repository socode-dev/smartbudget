import { FiClock } from "react-icons/fi";
import InsightBadge from "./InsightBadge";
import InsightPreview from "./InsightPreview";
import InsightActions from "./InsightActions";
import useInsightViewed from "../../hooks/useInsightViewed";
import { formatInsightDate, insightTypeLabel } from "./insightPresentation";

const FullInsightCard = ({ insight, surface }) => {
  const cardRef = useInsightViewed(insight, surface);

  return (
    <article
      ref={cardRef}
      className="grid min-w-0 grid-cols-1 gap-5 rounded-xl border border-border bg-card p-5 min-[1100px]:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <InsightBadge value={insight.severity || "LOW"} severity />

          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
            {insightTypeLabel(insight.type)}
          </span>

          {insight.category && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
              {insight.category}
            </span>
          )}
        </div>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed wrap-anywhere">
          {insight.message || "No explanation recorded."}
        </p>

        {insight.expiresAt && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <FiClock aria-hidden="true" />
            Expires {formatInsightDate(insight.expiresAt)}
          </p>
        )}
      </div>

      <InsightActions insight={insight} surface={surface} />
    </article>
  );
};

const InsightCard = ({
  insight,
  surface = "insights_page",
  compact = false,
}) =>
  compact ? (
    <InsightPreview insight={insight} />
  ) : (
    <FullInsightCard insight={insight} surface={surface} />
  );

export default InsightCard;
