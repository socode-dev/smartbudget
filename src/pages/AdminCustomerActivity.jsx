import { useCallback, useEffect, useState } from "react";
import {
    FiActivity,
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiEye,
    FiRefreshCw,
    FiUsers,
} from "react-icons/fi";
import AdminDailyTrend from "../components/admin/AdminDailyTrend";
import AdminMetricGroup from "../components/admin/AdminMetricGroup";
import AdminDailyMetricCard from "../components/admin/AdminDailyMetricCard";
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

const uniqueCustomerCards = uniqueCustomers => {
    const values = uniqueCustomers?.values || {};

    return [
        { label: "Imported customers", value: values.customer_imported || 0, description: "Unique customers with an import event.", icon: FiUsers, tone: "primary" },
        { label: "Claimed customers", value: values.customer_claimed || 0, description: "Unique customers with a claim event.", icon: FiCheckCircle, tone: "success" },
        { label: "Unique active customers", value: values.customer_active || 0, description: "Distinct customers with an active-session event in the period.", icon: FiActivity, tone: "success" },
        { label: "Viewed insights", value: values.insight_viewed || 0, description: "Unique customers with an insight-viewed event.", icon: FiEye, tone: "primary" },
    ];
};

const AdminCustomerActivity = () => {
    const [range, setRange] = useState(30);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCustomerActivity = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAdminTelemetry({
                section: "customerActivity",
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
        void loadCustomerActivity();
    }, [loadCustomerActivity]);

    const metrics = telemetry?.metrics || {};
    const lifecycleCards = [
        { label: "Customers imported", value: metrics.customersImported || 0, description: "Customer-import events observed.", icon: FiUsers, tone: "primary" },
        { label: "Customers claimed", value: metrics.customersClaimed || 0, description: "Customer-claim events observed.", icon: FiCheckCircle, tone: "success" },
    ];
    const insightCards = [
        { label: "Insights generated", value: metrics.insightsGenerated || 0, description: "Insight-generation events observed.", icon: FiActivity, tone: "primary" },
        { label: "Insights viewed", value: metrics.insightsViewed || 0, description: "Insight-viewed events observed.", icon: FiEye, tone: "primary" },
        { label: "Insights acknowledged", value: metrics.insightsAcknowledged || 0, description: "Acknowledgement events observed.", icon: FiCheckCircle, tone: "success" },
        { label: "Insights dismissed", value: metrics.insightsDismissed || 0, description: "Dismissal events observed.", icon: FiAlertTriangle, tone: "warning" },
        { label: "Insights expired", value: metrics.insightsExpired || 0, description: "Expiration events observed.", icon: FiAlertCircle, tone: "warning" },
    ];
    const signalCards = [
        { label: "Budget breaches", value: metrics.budgetBreaches || 0, description: "Budget-breach events observed.", icon: FiAlertTriangle, tone: "warning" },
        { label: "Breaches resolved", value: metrics.budgetBreachesResolved || 0, description: "Budget-breach-resolution events observed.", icon: FiCheckCircle, tone: "success" },
        { label: "Anomalies detected", value: metrics.anomaliesDetected || 0, description: "Anomaly-detection events observed.", icon: FiAlertCircle, tone: "danger" },
    ];

    return (
        <div className="mx-auto w-full max-w-[90rem] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Vydra Admin</p>
                    <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">
                        Observed customer activity
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Review customer and product events recorded after data enters Vydra.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl border border-border bg-card p-1" aria-label="Customer activity date range" role="group">
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
                    <Tooltip content="Refresh customer activity" side="bottom">
                        <Button variant="outline" className="size-10 min-h-10 p-0!" onClick={loadCustomerActivity} aria-label="Refresh customer activity" disabled={loading}>
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
                <AdminTelemetryError title="Customer activity unavailable" error={error} onRetry={loadCustomerActivity} />
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <p>Observed telemetry for {formatPeriod(telemetry?.period)}.</p>
                        <p>Global scope</p>
                    </div>
                    <AdminMetricGroup title="Customer lifecycle" description="Observed import, claim, and active-session events." cards={lifecycleCards}>
                        <AdminDailyMetricCard
                            daily={telemetry?.daily || []}
                            metricKey="activeCustomers"
                            label="Daily active customers"
                            description="Unique customers with an active-session event"
                            icon={FiActivity}
                        />
                    </AdminMetricGroup>
                    <AdminMetricGroup title="Insight activity" description="Observed events around generated and viewed insights. These counts do not establish causality or financial impact." cards={insightCards} />
                    <AdminMetricGroup title="Financial signal events" description="Observed budget-breach and anomaly events recorded by Vydra." cards={signalCards} />
                    {telemetry?.uniqueCustomers?.available !== false ? (
                        <AdminMetricGroup title="Unique customers observed" description="Unique customer markers for selected event types during this period." cards={uniqueCustomerCards(telemetry?.uniqueCustomers)} />
                    ) : (
                        <section className="rounded-xl border border-warning/40 bg-warning-soft p-5">
                            <h2 className="font-display text-base font-semibold">Unique customer markers unavailable</h2>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                Event aggregates are available, but unique-customer markers could not be read for this period.
                            </p>
                        </section>
                    )}
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <AdminDailyTrend
                            daily={telemetry?.daily || []}
                            metricKey="insightsGenerated"
                            title="Insight generation activity"
                            description="Daily insight-generation events observed."
                            emptyMessage="No insight-generation events recorded for this period."
                            valueLabel="insight events"
                        />
                        <AdminDailyTrend
                            daily={telemetry?.daily || []}
                            metricKey="anomaliesDetected"
                            title="Anomaly activity"
                            description="Daily anomaly-detection events observed."
                            emptyMessage="No anomaly events recorded for this period."
                            valueLabel="anomaly events"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminCustomerActivity;
