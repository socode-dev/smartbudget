const PieChart = () => {
  return (
    <div className="bg-[rgb(var(--color-bg-card))] rounded-lg p-2 shadow">
      <svg
        width="100%"
        height="240"
        viewBox="0 0 240 240"
        className="w-full h-56"
      >
        {/* Pie chart slices */}
        <circle cx="120" cy="120" r="95" fill="#3b82f6" />
        <path d="M 120 120 L 120 25 A 95 95 0 0 1 215 120 Z" fill="#ef4444" />
        <path d="M 120 120 L 215 120 A 95 95 0 0 1 165 185 Z" fill="#f59e0b" />
        <path d="M 120 120 L 165 185 A 95 95 0 0 1 75 185 Z" fill="#10b981" />
        <path d="M 120 120 L 75 185 A 95 95 0 0 1 25 120 Z" fill="#8b5cf6" />
        <path d="M 120 120 L 25 120 A 95 95 0 0 1 120 25 Z" fill="#ec4899" />

        {/* Center circle */}
        <circle cx="120" cy="120" r="35" fill="white" />

        {/* Category labels */}
        <text
          x="190"
          y="95"
          className="text-xs fill-[rgb(var(--color-text))] font-medium"
        >
          Food
        </text>
        <text
          x="165"
          y="165"
          className="text-xs fill-[rgb(var(--color-text))] font-medium"
        >
          Transport
        </text>
        <text
          x="95"
          y="190"
          className="text-xs fill-[rgb(var(--color-text))] font-medium"
        >
          Shopping
        </text>
        <text
          x="15"
          y="165"
          className="text-xs fill-[rgb(var(--color-text))] font-medium"
        >
          Entertainment
        </text>
        <text
          x="45"
          y="95"
          className="text-xs fill-[rgb(var(--color-text))] font-medium"
        >
          Bills
        </text>
      </svg>

      {/* Legend */}
      <div className="w-fit mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 text-xs text-[rgb(var(--color-muted))]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="">Food (25%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="">Transport (20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="">Shopping (18%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="">Entertainment (15%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="">Bills (12%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          <span className="">Other (10%)</span>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
