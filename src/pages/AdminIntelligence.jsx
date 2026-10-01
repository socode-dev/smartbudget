import { useCallback, useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiFilter,
    FiRefreshCw,
    FiShield,
    FiZap,
} from "react-icons/fi";
import AdminDailyTrend from "../components/admin/AdminDailyTrend";
import AdminMetricGroup from "../components/admin/AdminMetricGroup";
import AdminTelemetryError from "../components/admin/AdminTelemetryError";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Tooltip from "../components/ui/Tooltip";
import { fetchAdminTelemetry } from "../api/adminTelemetry";

const rangeOptions = [
    { days: 7, label: "7 days" },
    { days: 30, label: "30 days" },
    { days: 90, label: "90 days" },
];

const toDateKey = date => date.toISOString().slice(0, 10);

const getDateRange = days => {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    return {
        startDate: toDateKey(start),
        endDate: toDateKey(end),
    };
};

const formatPeriod = period => period
    ? `${period.startDate} to ${period.endDate}`
    : "";

const AdminIntelligence = () => {
    const [range, setRange] = useState(30);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadIntelligence = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAdminTelemetry({
                section: "intelligence",
                ...getDateRange(range),
            });
            setTelemetry(result.telemetry);
        } catch (requestError) {
            setError(requestError);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        void loadIntelligence();
    }, [loadIntelligence]);

    const metrics = telemetry?.metrics || {};
    const pipelineCards = [
        { label: "Pipeline runs", value: metrics.totalPipelineRuns || 0, description: "Total pipeline executions.", icon: FiZap, tone: "primary" },
        { label: "Successful runs", value: metrics.successfulPipelineRuns || 0, description: "Executions completed successfully.", icon: FiCheckCircle, tone: "success" },
        { label: "Fallback runs", value: metrics.fallbackPipelineRuns || 0, description: "Executions completed with fallback handling.", icon: FiAlertTriangle, tone: "warning" },
        { label: "Failed runs", value: metrics.failedPipelineRuns || 0, description: "Executions that failed.", icon: FiAlertCircle, tone: "danger" },
        { label: "Blocked runs", value: metrics.blockedPipelineRuns || 0, description: "Executions stopped before completion.", icon: FiShield, tone: "warning" },
    ];
    const signalCards = [
        { label: "Raw signals seen", value: metrics.rawSignalsSeen || 0, description: "Signals emitted by deterministic engines.", icon: FiFilter, tone: "primary" },
        { label: "Scored signals", value: metrics.scoredSignalsSeen || 0, description: "Signals normalized and scored.", icon: FiFilter, tone: "success" },
        { label: "Attention allowed", value: metrics.attentionAllowedRuns || 0, description: "Runs allowed through the attention gate.", icon: FiCheckCircle, tone: "success" },
        { label: "Attention blocked", value: metrics.attentionBlockedRuns || 0, description: "Runs stopped by the attention gate.", icon: FiShield, tone: "warning" },
        { label: "Trigger eligible", value: metrics.triggerEligibleRuns || 0, description: "Runs eligible for insight triggering.", icon: FiZap, tone: "primary" },
        { label: "Trigger blocked", value: metrics.triggerBlockedRuns || 0, description: "Runs stopped by the trigger gate.", icon: FiShield, tone: "warning" },
        { label: "Reservation allowed", value: metrics.reservationAllowedRuns || 0, description: "Runs granted an execution reservation.", icon: FiCheckCircle, tone: "success" },
        { label: "Reservation blocked", value: metrics.reservationBlockedRuns || 0, description: "Runs denied an execution reservation.", icon: FiShield, tone: "warning" },
    ];
    const agentCards = [
        { label: "Agent runs", value: metrics.totalAgentRuns || 0, description: "Specialist agent executions.", icon: FiZap, tone: "primary" },
        { label: "Successful agents", value: metrics.successfulAgentRuns || 0, description: "Agent runs completed successfully.", icon: FiCheckCircle, tone: "success" },
        { label: "Fallback agents", value: metrics.fallbackAgentRuns || 0, description: "Agent runs completed with fallback handling.", icon: FiAlertTriangle, tone: "warning" },
        { label: "Failed agents", value: metrics.failedAgentRuns || 0, description: "Agent runs that failed.", icon: FiAlertCircle, tone: "danger" },
        { label: "Timeout agents", value: metrics.timeoutAgentRuns || 0, description: "Agent runs that timed out.", icon: FiClock, tone: "warning" },
        { label: "Malformed agents", value: metrics.malformedAgentRuns || 0, description: "Agent outputs that failed schema validation.", icon: FiAlertCircle, tone: "danger" },
    ];
    const insightCards = [
        { label: "Persisted insights", value: metrics.persistedInsights || 0, description: "Insights saved after validation.", icon: FiCheckCircle, tone: "success" },
        { label: "Fallback insights", value: metrics.fallbackInsights || 0, description: "Insights persisted through fallback handling.", icon: FiAlertTriangle, tone: "warning" },
        { label: "Generated events", value: metrics.generatedInsights || 0, description: "Insight generation events recorded.", icon: FiZap, tone: "primary" },
        { label: "High-severity insights", value: metrics.highSeverityInsights || 0, description: "Generated insights marked high severity.", icon: FiAlertTriangle, tone: "danger" },
    ];

    return (
        <div className="mx-auto w-full max-w-[90rem] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Vydra Admin</p>
                    <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">
                        Intelligence operations
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Follow deterministic signals, execution gates, specialist agents, and persisted insight outcomes.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl border border-border bg-card p-1" aria-label="Intelligence date range" role="group">
                        {rangeOptions.map(option => (
                            <button
                                key={option.days}
                                type="button"
                                onClick={() => setRange(option.days)}
                                aria-pressed={range === option.days}
                                className={range === option.days
                                    ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                                    : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <Tooltip content="Refresh intelligence" side="bottom">
                        <Button variant="outline" className="size-10 min-h-10 p-0!" onClick={loadIntelligence} aria-label="Refresh intelligence" disabled={loading}>
                            <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} aria-hidden="true" />
                        </Button>
                    </Tooltip>
                </div>
            </header>

            {loading && !telemetry ? (
                <div className="flex min-h-72 items-center justify-center rounded-xl border border-border bg-card">
                    <LoadingSpinner color="var(--primary)" borderTopColor="transparent" />
                </div>
            ) : error ? (
                <AdminTelemetryError title="Intelligence data unavailable" error={error} onRetry={loadIntelligence} />
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <p>Observed telemetry for {formatPeriod(telemetry?.period)}.</p>
                        <p>Global scope</p>
                    </div>
                    <AdminMetricGroup title="Pipeline execution" description="What happened as data moved through the intelligence pipeline." cards={pipelineCards} />
                    <AdminMetricGroup title="Signal processing and gates" description="Deterministic signal and gate decisions observed before agent execution." cards={signalCards} />
                    <AdminMetricGroup title="Specialist agents" description="Execution, fallback, timeout, and schema-validation outcomes." cards={agentCards} />
                    <AdminMetricGroup title="Insight outcomes" description="Observed persistence and generation outcomes from the intelligence layer." cards={insightCards} />
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <AdminDailyTrend daily={telemetry?.daily || []} />
                        <AdminDailyTrend
                            daily={telemetry?.daily || []}
                            metricKey="totalAgentRuns"
                            title="Agent activity"
                            description="Daily specialist agent executions across the selected period."
                            emptyMessage="No agent activity recorded for this period."
                            valueLabel="agent runs"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminIntelligence;
