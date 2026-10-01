import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import Button from "../ui/Button";

const getErrorMessage = error => {
    if (error?.status === 401 || error?.status === 403) {
        return "Your Admin session is no longer authorized. Sign in again and retry the request.";
    }

    if (error?.status === 404) {
        return "The telemetry endpoint is unavailable in this runtime. Restart the local Vercel server and try again.";
    }

    if (error?.status >= 500) {
        return "The telemetry service could not complete this request. The underlying data may still be available after a retry.";
    }

    return "The telemetry service did not return a usable response. Check the server logs and try again.";
};

const AdminTelemetryError = ({ title = "Telemetry unavailable", error, onRetry }) => (
    <section className="rounded-xl border border-danger/40 bg-danger-soft p-5 sm:p-6" role="alert">
        <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger">
                <FiAlertCircle className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-danger">
                    Request failed
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
                    {title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {getErrorMessage(error)}
                </p>
                <Button className="mt-4" variant="outline" onClick={onRetry}>
                    <FiRefreshCw size={15} aria-hidden="true" />
                    Try again
                </Button>
            </div>
        </div>
    </section>
);

export default AdminTelemetryError;
