import clsx from "clsx";

const views = ["active", "history"];

export default function InsightTabs({ activeView, selectView }) {
  const handleTabKey = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "active"
        : event.key === "End"
          ? "history"
          : views[(views.indexOf(activeView) + 1) % views.length];
    selectView(next);
    document.getElementById(`insights-tab-${next}`)?.focus();
  };

  return (
    <div
      id="insights-tabs"
      role="tablist"
      aria-label="Insight views"
      className={clsx(
        "flex w-fit max-w-full flex-wrap gap-1 rounded-xl bg-secondary p-1 [&>button]:inline-flex [&>button]:min-h-7",
        "[&>button]:cursor-pointer [&>button]:items-center [&>button]:justify-center [&>button]:gap-2 [&>button]:rounded-lg",
        "[&>button]:px-3 [&>button]:py-1 [&>button]:text-sm [&>button]:leading-5 [&>button]:font-medium",
        "[&>button]:text-muted-foreground [&>button[aria-selected=true]]:bg-card [&>button[aria-selected=true]]:text-foreground",
        "[&>button[aria-selected=true]]:shadow-sm [&>button]:focus-visible:outline-2 [&>button]:focus-visible:outline-ring",
      )}
      onKeyDown={handleTabKey}
    >
      {views.map((view) => (
        <button
          key={view}
          type="button"
          role="tab"
          id={`insights-tab-${view}`}
          aria-selected={activeView === view}
          aria-controls={`insights-panel-${view}`}
          tabIndex={activeView === view ? 0 : -1}
          onClick={() => selectView(view)}
        >
          {view === "active" ? "Active insights" : "History"}
        </button>
      ))}
    </div>
  );
}
