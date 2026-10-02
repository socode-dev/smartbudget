import { useCallback, useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiDatabase,
    FiDownload,
    FiRefreshCw,
    FiUsers,
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

const AdminDataOperations = () => {
    const [range, setRange] = useState(30);
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDataOperations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAdminTelemetry({
                section: "dataOperations",
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
        void loadDataOperations();
    }, [loadDataOperations]);

    const metrics = telemetry?.metrics || {};
    const importCards = [
        { label: "Imports received", value: metrics.sftpImportsReceived || 0, description: "SFTP import events received.", icon: FiDownload, tone: "primary" },
        { label: "Imports processed", value: metrics.sftpImportsProcessed || 0, description: "SFTP import events processed.", icon: FiCheckCircle, tone: "success" },
        { label: "Import failures", value: metrics.sftpImportsFailed || 0, description: "SFTP import events recorded as failed.", icon: FiAlertCircle, tone: "danger" },
        { label: "Financial data imports", value: metrics.sftpFinancialDataImports || 0, description: "SFTP financial-data import events.", icon: FiDatabase, tone: "primary" },
    ];
    const customerCards = [
        { label: "SFTP customers imported", value: metrics.sftpCustomersImported || 0, description: "Customers imported through SFTP.", icon: FiUsers, tone: "primary" },
        { label: "Customers imported", value: metrics.customersImported || 0, description: "Customer-import events recorded.", icon: FiUsers, tone: "success" },
        { label: "Customers claimed", value: metrics.customersClaimed || 0, description: "Imported customer profiles claimed by users.", icon: FiCheckCircle, tone: "success" },
    ];

    return (
        <div className="mx-auto w-full max-w-[90rem] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Vydra Admin</p>
                    <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">
                        Data operations
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Track how customer and financial data enters Vydra and where ingestion requires attention.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl border border-border bg-card p-1" aria-label="Data operations date range" role="group">
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
                    <Tooltip content="Refresh data operations" side="bottom">
                        <Button variant="outline" className="size-10 min-h-10 p-0!" onClick={loadDataOperations} aria-label="Refresh data operations" disabled={loading}>
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
                <AdminTelemetryError title="Data operations unavailable" error={error} onRetry={loadDataOperations} />
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <p>Observed telemetry for {formatPeriod(telemetry?.period)}.</p>
                        <p>Global scope</p>
                    </div>
                    <AdminMetricGroup title="Import processing" description="Movement and processing outcomes for SFTP imports." cards={importCards} />
                    <AdminMetricGroup title="Customer-data ingestion" description="Observed customer import and claim events after data enters Vydra." cards={customerCards} />
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <AdminDailyTrend
                            daily={telemetry?.daily || []}
                            metricKey="sftpImportsReceived"
                            title="Imports received"
                            description="Daily SFTP imports received across the selected period."
                            emptyMessage="No SFTP imports recorded for this period."
                            valueLabel="imports received"
                        />
                        <AdminDailyTrend
                            daily={telemetry?.daily || []}
                            metricKey="sftpImportsFailed"
                            title="Import failures"
                            description="Daily SFTP imports recorded as failed."
                            emptyMessage="No SFTP import failures recorded for this period."
                            valueLabel="import failures"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDataOperations;
