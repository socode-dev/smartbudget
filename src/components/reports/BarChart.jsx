import React from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const data = [
  { income: 320, expenses: 180, balance: 140 },
  { income: 280, expenses: 200, balance: 80 },
  { income: 350, expenses: 240, balance: 110 },
  { income: 200, expenses: 100, balance: 100 },
  { income: 300, expenses: 280, balance: 20 },
  { income: 250, expenses: 200, balance: 50 },
  { income: 220, expenses: 150, balance: 70 },
];
const max = Math.max(...data.flatMap((d) => [d.income, d.expenses, d.balance]));
const barWidth = 12;
const groupWidth = 44;
const chartHeight = 140;
const chartTop = 30;
const chartBottom = 180;

const colors = {
  income: "#22c55e", // green
  expenses: "#ef4444", // red
  balance: "#3b82f6", // blue
};

const BarChart = () => (
  <div className="w-full h-full flex flex-col items-center">
    <svg width="100%" height="200" viewBox="0 0 350 200">
      {/* Y-axis label */}
      <text
        x="10"
        y="105"
        textAnchor="middle"
        fontSize="13"
        fontWeight="semibold"
        fill="#64748b"
        transform="rotate(-90 10,110)"
      >
        Amount
      </text>
      {/* Y-axis ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <g key={i}>
          <line
            x1={38}
            x2={340}
            y1={chartBottom - t * chartHeight}
            y2={chartBottom - t * chartHeight}
            stroke="#e5e7eb"
            strokeDasharray="2 2"
          />
          <text
            x={32}
            y={chartBottom - t * chartHeight + 4}
            textAnchor="end"
            fontSize="11"
            fill="#94a3b8"
          >
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      {/* Bars */}
      {data.map((d, i) => (
        <g key={i}>
          {/* Income */}
          <rect
            x={50 + i * groupWidth}
            y={chartBottom - (d.income / max) * chartHeight}
            width={barWidth}
            height={(d.income / max) * chartHeight}
            fill={colors.income}
            rx={3}
          />
          {/* Expenses */}
          <rect
            x={50 + i * groupWidth + barWidth + 2}
            y={chartBottom - (d.expenses / max) * chartHeight}
            width={barWidth}
            height={(d.expenses / max) * chartHeight}
            fill={colors.expenses}
            rx={3}
          />
          {/* Balance */}
          <rect
            x={50 + i * groupWidth + 2 * (barWidth + 2)}
            y={chartBottom - (d.balance / max) * chartHeight}
            width={barWidth}
            height={(d.balance / max) * chartHeight}
            fill={colors.balance}
            rx={3}
          />
        </g>
      ))}
      {/* X-axis labels */}
      {months.map((label, i) => (
        <text
          key={label}
          x={50 + i * groupWidth + groupWidth / 2}
          y={195}
          textAnchor="middle"
          fontSize="12"
          fill="#64748b"
        >
          {label}
        </text>
      ))}
    </svg>
    {/* Legend */}
    <div className="flex gap-6 mt-10">
      <div className="flex items-center gap-1">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: colors.income }}
        ></span>
        <span className="text-xs text-[rgb(var(--color-muted))]">Income</span>
      </div>
      <div className="flex items-center gap-1">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: colors.expenses }}
        ></span>
        <span className="text-xs text-[rgb(var(--color-muted))]">Expenses</span>
      </div>
      <div className="flex items-center gap-1">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ background: colors.balance }}
        ></span>
        <span className="text-xs text-[rgb(var(--color-muted))]">Balance</span>
      </div>
    </div>
  </div>
);

export default BarChart;
