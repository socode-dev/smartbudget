import clsx from "clsx";

const toneClasses = {
    primary: "border-t-primary text-primary bg-info-soft",
    success: "border-t-success text-success bg-success-soft",
    warning: "border-t-warning text-warning bg-warning-soft",
    danger: "border-t-danger text-danger bg-danger-soft",
};

const AdminMetricCard = ({ label, value, description, icon: Icon, tone = "primary" }) => (
    <article
        className={clsx(
            "min-w-0 rounded-xl border border-border border-t-2 bg-card p-5 shadow-xs",
            toneClasses[tone]?.split(" ")[0] || toneClasses.primary.split(" ")[0],
        )}
    >
        <div className="flex items-start justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                {label}
            </h2>
            <span
                className={clsx(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl",
                    toneClasses[tone]?.split(" ").slice(1).join(" ") || "bg-info-soft text-primary",
                )}
            >
                <Icon className="size-4" aria-hidden="true" />
            </span>
        </div>
        <p className="mt-5 font-display text-3xl font-semibold tabular-nums text-foreground">
            {value.toLocaleString()}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {description}
        </p>
    </article>
);

export default AdminMetricCard;
