import BarChart from "../charts/BarChart";
import DoughnutChart from "../charts/DoughnutChart";

export default function ReportCharts({ categories }) {

  return (
    <section
      id="reports-charts"
      aria-label="Spending charts"
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
    >
      <figure className="min-w-0 border border-border rounded-xl p-4 [&_figcaption]:mb-6">
        <figcaption>
          <h2 className="font-display text-base font-semibold">
            Spending by category
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Total expenses across your transaction history.
          </p>
        </figcaption>

        <BarChart />
      </figure>

      <figure className="min-w-0 border border-border rounded-xl p-4 [&_figcaption]:mb-6">
        <figcaption>
          <h2 className="font-display text-base font-semibold">
            Category breakdown
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Share of total spending.
          </p>
        </figcaption>

        <div className="grid grid-cols-1 items-center gap-6 xs:grid-cols-2 lg:grid-cols-1 min-[1280px]:grid-cols-2">
          <DoughnutChart page="reports" />
          
          <ul className="grid min-w-0 gap-3 text-[13px] [&>li]:flex [&>li]  :items-start [&>li]:justify-between [&>li]:gap-3">
            {categories.map((row) => (
              <li key={row.category}>
                <span className="inline-flex min-w-0 items-baseline gap-2 wrap-anywhere">
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-xs"
                    style={{
                      backgroundColor: row.color,
                    }}
                    aria-hidden="true"
                  />
                  {row.category}
                </span>
                
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {row.percentage.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </figure>
    </section>
  );
}
