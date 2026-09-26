import { FiAlertTriangle, FiRefreshCcw } from "react-icons/fi";
import Button from "../components/ui/Button";

const ErrorFallback = ({ resetErrorBoundary }) => {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <FiAlertTriangle size={22} aria-hidden="true" />
        </span>

        <h2 className="mt-5 font-display text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This section could not load correctly. Try again or return to the
          previous screen.
        </p>

        <Button onClick={resetErrorBoundary} className="mt-6 w-full sm:w-auto">
          <span className="flex items-center justify-center gap-2">
            <FiRefreshCcw aria-hidden="true" />
            Try again
          </span>
        </Button>
      </section>
    </div>
  );
};

export default ErrorFallback;
