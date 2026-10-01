import { FiActivity } from "react-icons/fi";

const formatDate = dateKey => new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
}).format(new Date(`${dateKey}T00:00:00.000Z`));

const AdminDailyTrend = ({
    daily,
    metricKey = "totalPipelineRuns",
    title = "Pipeline activity",
    description = "Daily pipeline runs across the selected period.",
    emptyMessage = "No activity recorded for this period.",
    valueLabel = "pipeline runs",
}) => {
    const visibleDays = daily.slice(-14);
    const maxValue = Math.max(
        ...visibleDays.map(day => day.metrics[metricKey] || 0),
        1,
    );

    return (
        <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <FiActivity className="size-4 text-primary" aria-hidden="true" />
                            <h2 className="font-display text-base font-semibold">
                            {title}
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <span className="text-xs text-muted-foreground">Last 14 days</span>
            </div>

            {visibleDays.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                    {emptyMessage}
                </div>
            ) : (
                <div className="mt-6 grid min-h-48 grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1.5 sm:gap-2">
                    {visibleDays.map(day => {
                        const value = day.metrics[metricKey] || 0;
                        const height = value === 0 ? 4 : Math.max((value / maxValue) * 100, 10);

                        return (
                            <div
                                key={day.dateKey}
                                className="flex min-w-0 h-full flex-col items-center justify-end gap-2"
                                title={`${formatDate(day.dateKey)}: ${value.toLocaleString()} ${valueLabel}`}
                            >
                                <span className="text-[10px] tabular-nums text-muted-foreground">
                                    {value > 0 ? value.toLocaleString() : ""}
                                </span>
                                <div className="flex h-32 w-full items-end rounded-sm bg-surface">
                                    <div
                                        className="w-full rounded-sm bg-primary transition-[height]"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="truncate text-[10px] text-muted-foreground">
                                    {formatDate(day.dateKey)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default AdminDailyTrend;
