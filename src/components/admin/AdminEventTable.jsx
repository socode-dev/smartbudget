import { FiChevronDown, FiClock } from "react-icons/fi";

const formatDateTime = timestamp => {
    if (!timestamp) return "Unknown time";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(Number(timestamp)));
};

const getEventLabel = event => event.eventType
    || event.status
    || event.agentType
    || "Telemetry event";

const getEventIdentifier = event => event.eventId
    || event.runId
    || event.agentRunId
    || event.insightId
    || "No identifier";

const AdminEventTable = ({ events }) => (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                <thead className="bg-surface text-xs text-muted-foreground">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Event</th>
                        <th className="px-4 py-3 font-semibold">Identifier</th>
                        <th className="px-4 py-3 font-semibold">Recorded</th>
                        <th className="w-12 px-4 py-3"><span className="sr-only">Details</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {events.map((event, index) => (
                        <tr key={event.eventId || event.runId || event.agentRunId || `${getEventLabel(event)}-${index}`} className="align-top hover:bg-surface/60">
                            <td className="px-4 py-3">
                                <p className="font-medium text-foreground">{getEventLabel(event)}</p>
                                {event.reason && <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground" title={event.reason}>{event.reason}</p>}
                            </td>
                            <td className="max-w-xs px-4 py-3 font-mono text-xs text-muted-foreground">
                                <span className="block truncate" title={getEventIdentifier(event)}>{getEventIdentifier(event)}</span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <FiClock className="size-3.5" aria-hidden="true" />
                                    {formatDateTime(event.createdAtMs)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <details className="group">
                                    <summary className="inline-flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                                        <FiChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                                        <span className="sr-only">View event details</span>
                                    </summary>
                                    <pre className="absolute right-4 z-10 mt-2 max-h-72 w-[min(32rem,calc(100vw-2rem))] overflow-auto rounded-lg border border-border bg-background p-3 text-left text-[11px] leading-relaxed text-muted-foreground shadow-lg">
                                        {JSON.stringify(event, null, 2)}
                                    </pre>
                                </details>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default AdminEventTable;
