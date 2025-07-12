const LineChart = () => {
  return (
    <div className="bg-[rgb(var(--color-bg-card))] rounded-lg p-4 shadow">
      <svg
        width="100%"
        height="240"
        viewBox="0 0 400 240"
        className="w-full h-56"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Y-axis labels */}
        <text
          x="10"
          y="30"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium"
        >
          $5k
        </text>
        <text
          x="10"
          y="70"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium"
        >
          $4k
        </text>
        <text
          x="10"
          y="110"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium"
        >
          $3k
        </text>
        <text
          x="10"
          y="150"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium"
        >
          $2k
        </text>
        <text
          x="10"
          y="190"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium"
        >
          $1k
        </text>

        {/* Income line */}
        <path
          d="M 50 190 L 100 170 L 150 150 L 200 130 L 250 110 L 300 90 L 350 70"
          stroke="#10b981"
          strokeWidth="3"
          fill="none"
          className="drop-shadow-sm"
        />
        <circle cx="50" cy="190" r="4" fill="#10b981" />
        <circle cx="100" cy="170" r="4" fill="#10b981" />
        <circle cx="150" cy="150" r="4" fill="#10b981" />
        <circle cx="200" cy="130" r="4" fill="#10b981" />
        <circle cx="250" cy="110" r="4" fill="#10b981" />
        <circle cx="300" cy="90" r="4" fill="#10b981" />
        <circle cx="350" cy="70" r="4" fill="#10b981" />

        {/* Expenses line */}
        <path
          d="M 50 210 L 100 200 L 150 180 L 200 160 L 250 140 L 300 120 L 350 100"
          stroke="#ef4444"
          strokeWidth="3"
          fill="none"
          className="drop-shadow-sm"
        />
        <circle cx="50" cy="210" r="4" fill="#ef4444" />
        <circle cx="100" cy="200" r="4" fill="#ef4444" />
        <circle cx="150" cy="180" r="4" fill="#ef4444" />
        <circle cx="200" cy="160" r="4" fill="#ef4444" />
        <circle cx="250" cy="140" r="4" fill="#ef4444" />
        <circle cx="300" cy="120" r="4" fill="#ef4444" />
        <circle cx="350" cy="100" r="4" fill="#ef4444" />

        {/* X-axis labels */}
        <text
          x="50"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          Jan
        </text>
        <text
          x="100"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          Feb
        </text>
        <text
          x="150"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          Mar
        </text>
        <text
          x="200"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          Apr
        </text>
        <text
          x="250"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          May
        </text>
        <text
          x="300"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          Jun
        </text>
        <text
          x="350"
          y="235"
          className="text-xs fill-[rgb(var(--color-muted))] font-medium text-center"
        >
          Jul
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-[rgb(var(--color-muted))]">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs text-[rgb(var(--color-muted))]">
            Expenses
          </span>
        </div>
      </div>
    </div>
  );
};

export default LineChart;
