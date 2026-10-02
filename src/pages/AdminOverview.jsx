import { useCallback, useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiDatabase,
    FiActivity,
    FiRefreshCw,
} from "react-icons/fi";
import AdminDailyTrend from "../components/admin/AdminDailyTrend";
import AdminDailyMetricCard from "../components/admin/AdminDailyMetricCard";
import AdminMetricCard from "../components/admin/AdminMetricCard";
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

const formatPeriod = period => {
    if (!period) return "";

    return `${period.startDate} to ${period.endDate}`;
};

const AdminOverview = () => {
    const [range, setRange] = useState(30);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAdminTelemetry({
                section: "overview",
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
        void loadOverview();
    }, [loadOverview]);

    const metrics = telemetry?.metrics || {};
    const cards = [
        {
            label: "Pipeline runs",
            value: metrics.totalPipelineRuns || 0,
            description: "Total intelligence pipeline executions.",
            icon: FiCheckCircle,
            tone: "primary",
        },
        {
            label: "Failed runs",
            value: metrics.failedPipelineRuns || 0,
            description: "Pipeline executions that failed.",
            icon: FiAlertCircle,
            tone: "danger",
        },
        {
            label: "Blocked runs",
            value: metrics.blockedPipelineRuns || 0,
            description: "Executions stopped by an operational gate.",
            icon: FiAlertTriangle,
            tone: "warning",
        },
        {
            label: "Persisted insights",
            value: metrics.persistedInsights || 0,
            description: "Insights successfully persisted.",
            icon: FiCheckCircle,
            tone: "success",
        },
        {
            label: "Imports received",
            value: metrics.sftpImportsReceived || 0,
            description: "SFTP import events received.",
            icon: FiDatabase,
            tone: "primary",
        },
        {
            label: "Import failures",
            value: metrics.sftpImportsFailed || 0,
            description: "SFTP imports recorded as failed.",
            icon: FiAlertCircle,
            tone: "danger",
        },
        {
            label: "High-severity insights",
            value: metrics.highSeverityInsights || 0,
            description: "High-severity insights generated.",
            icon: FiAlertTriangle,
            tone: "warning",
        },
    ];

    return (
        <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Vydra Admin</p>
                    <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">
                        Operational overview
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        A concise view of the signals that indicate how Vydra is operating.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div
                        className="flex rounded-xl border border-border bg-card p-1"
                        aria-label="Overview date range"
                        role="group"
                    >
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
                    <Tooltip content="Refresh overview" side="bottom">
                        <Button
                            variant="outline"
                            className="size-10 min-h-10 p-0!"
                            onClick={loadOverview}
                            aria-label="Refresh overview"
                            disabled={loading}
                        >
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
                <AdminTelemetryError title="Overview unavailable" error={error} onRetry={loadOverview} />
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <p>Observed telemetry for {formatPeriod(telemetry?.period)}.</p>
                        <p>Global scope</p>
                    </div>

                    <section aria-label="Operational summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(card => <AdminMetricCard key={card.label} {...card} />)}
                        <AdminDailyMetricCard
                            daily={telemetry?.daily || []}
                            metricKey="activeCustomers"
                            label="Daily active customers"
                            description="Unique customers with an active-session event"
                            icon={FiActivity}
                        />
                    </section>

                    <AdminDailyTrend daily={telemetry?.daily || []} />
                </>
            )}
        </div>
    );
};

export default AdminOverview;
