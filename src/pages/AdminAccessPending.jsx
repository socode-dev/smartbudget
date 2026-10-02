import { useLocation } from "react-router-dom";

const sectionContent = {
  "/admin": {
    eyebrow: "Admin overview",
    title: "Operational overview",
    description:
      "Review Vydra's intelligence pipeline, data operations, and observed customer activity.",
  },
  "/admin/intelligence": {
    eyebrow: "Intelligence",
    title: "Intelligence operations",
    description:
      "Monitor pipeline execution, deterministic signals, agent runs, and persisted insights.",
  },
  "/admin/data-operations": {
    eyebrow: "Data operations",
    title: "Data operations",
    description:
      "Track customer-data ingestion, import processing, and operational failures.",
  },
  "/admin/customer-activity": {
    eyebrow: "Customer activity",
    title: "Observed customer activity",
    description:
      "Review measured customer and product events without inferring unsupported outcomes.",
  },
  "/admin/investigation": {
    eyebrow: "Investigation",
    title: "Operational investigation",
    description:
      "Inspect the underlying runs, events, reasons, and records behind operational signals.",
  },
};

const AdminAccessPending = () => {
  const { pathname } = useLocation();
  const content = sectionContent[pathname] || sectionContent["/admin"];

  return (
    <div className="flex min-h-full items-center justify-center bg-background px-6 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {content.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          {content.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {content.description}
        </p>
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          Telemetry-backed operational signals will appear here.
        </p>
      </section>
    </div>
  );
};

export default AdminAccessPending;
