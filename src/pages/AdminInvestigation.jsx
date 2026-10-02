import { useState } from "react";
import { FiDatabase, FiSearch } from "react-icons/fi";
import AdminEventTable from "../components/admin/AdminEventTable";
import AdminTelemetryError from "../components/admin/AdminTelemetryError";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { fetchAdminTelemetryEvents } from "../api/adminTelemetry";

const categories = [
    { value: "aiPipelineRuns", label: "AI pipeline runs" },
    { value: "aiAgentRuns", label: "AI agent runs" },
    { value: "insightEvents", label: "Insight events" },
    { value: "businessEvents", label: "Business events" },
];

const getToday = () => new Date().toISOString().slice(0, 10);

const toTimestamp = (date, endOfDay = false) => {
    if (!date) return null;

    return Date.parse(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
};

const AdminInvestigation = () => {
    const [scopeType, setScopeType] = useState("user");
    const [subjectId, setSubjectId] = useState("");
    const [category, setCategory] = useState("aiPipelineRuns");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState(getToday());
    const [limit, setLimit] = useState("100");
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runInvestigation = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAdminTelemetryEvents({
                subjectType: scopeType,
                subjectId: subjectId.trim(),
                category,
                startAtMs: toTimestamp(startDate),
                endAtMs: toTimestamp(endDate, true),
                limit,
            });
            setEvents(result.events || []);
        } catch (requestError) {
            setError(requestError);
            setEvents(null);
        } finally {
            setLoading(false);
        }
    };

    const investigate = event => {
        event.preventDefault();
        void runInvestigation();
    };

    return (
        <div className="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
            <header>
                <p className="text-sm text-muted-foreground">Vydra Admin</p>
                <h1 className="mt-1 font-display text-3xl font-semibold leading-tight">Operational investigation</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Inspect the underlying telemetry events behind an operational signal.
                </p>
            </header>

            <section className="rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info-soft text-primary">
                        <FiDatabase className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="font-display text-base font-semibold">Choose an investigation scope</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Detail records are scoped to a Vydra user or institution and are not aggregate dashboard metrics.
                        </p>
                    </div>
                </div>

                <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={investigate}>
                    <label className="text-sm font-medium text-foreground">
                        Subject type
                        <select value={scopeType} onChange={event => setScopeType(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40">
                            <option value="user">Vydra user / customer</option>
                            <option value="institution">Institution</option>
                        </select>
                    </label>
                    <label className="text-sm font-medium text-foreground">
                        Subject ID
                        <Input className="mt-1.5" value={subjectId} onChange={event => setSubjectId(event.target.value)} placeholder={scopeType === "user" ? "Firebase UID" : "Institution ID"} required />
                    </label>
                    <label className="text-sm font-medium text-foreground">
                        Telemetry category
                        <select value={category} onChange={event => setCategory(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40">
                            {categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-foreground">
                        Start date
                        <input type="date" value={startDate} max={endDate} onChange={event => setStartDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40" />
                    </label>
                    <label className="text-sm font-medium text-foreground">
                        End date
                        <input type="date" value={endDate} min={startDate || undefined} onChange={event => setEndDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40" />
                    </label>
                    <label className="text-sm font-medium text-foreground">
                        Maximum events
                        <select value={limit} onChange={event => setLimit(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40">
                            <option value="25">25</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                            <option value="500">500</option>
                        </select>
                    </label>
                    <div className="md:col-span-2 xl:col-span-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? <LoadingSpinner compact size={16} color="currentColor" borderTopColor="transparent" /> : <FiSearch size={16} aria-hidden="true" />}
                            Investigate events
                        </Button>
                    </div>
                </form>
            </section>

            {error && <AdminTelemetryError title="Investigation unavailable" error={error} onRetry={runInvestigation} />}

            {events && !error && (
                events.length > 0 ? (
                    <section>
                        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <h2 className="font-display text-lg font-semibold">Event records</h2>
                                <p className="mt-1 text-sm text-muted-foreground">{events.length.toLocaleString()} event{events.length === 1 ? "" : "s"} returned, newest first.</p>
                            </div>
                        </div>
                        <AdminEventTable events={events} />
                    </section>
                ) : (
                    <section className="rounded-xl border border-border bg-card p-8 text-center shadow-xs">
                        <FiSearch className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
                        <h2 className="mt-3 font-display text-lg font-semibold">No events found</h2>
                        <p className="mt-1 text-sm text-muted-foreground">No telemetry records matched the selected scope and date range.</p>
                    </section>
                )
            )}
        </div>
    );
};

export default AdminInvestigation;
