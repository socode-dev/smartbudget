import React from "react";

const data = [40, 25, 20, 15];
const colors = ["#3b82f6", "#22c55e", "#f59e42", "#ef4444"];
const labels = ["Rent", "Groceries", "Transport", "Other"];
const total = data.reduce((a, b) => a + b, 0);

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = {
    x: cx + r * Math.cos((Math.PI * startAngle) / 180),
    y: cy + r * Math.sin((Math.PI * startAngle) / 180),
  };
  const end = {
    x: cx + r * Math.cos((Math.PI * endAngle) / 180),
    y: cy + r * Math.sin((Math.PI * endAngle) / 180),
  };
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

const PieChart = () => {
  let cumulative = 0;
  const cx = 160,
    cy = 160,
    r = 120; // Increased size
  // For label positions
  let labelAngles = [];
  let running = 0;
  for (let i = 0; i < data.length; i++) {
    const startAngle = (running / total) * 360;
    running += data[i];
    const endAngle = (running / total) * 360;
    labelAngles.push((startAngle + endAngle) / 2);
  }
  return (
    <div className="w-full h-full flex flex-col items-center">
      <svg width="280" height="280" viewBox="0 0 280 280">
        {(() => {
          let cumulative = 0;
          return data.map((value, i) => {
            const startAngle = (cumulative / total) * 360;
            cumulative += value;
            const endAngle = (cumulative / total) * 360;
            // Label position
            const midAngle = (startAngle + endAngle) / 2;
            const labelRadius = r * 0.65;
            const percent = ((value / total) * 100).toFixed(0);
            const labelX =
              cx + labelRadius * Math.cos((Math.PI * midAngle) / 180);
            const labelY =
              cy + labelRadius * Math.sin((Math.PI * midAngle) / 180);
            return (
              <g key={i}>
                <path
                  d={describeArc(cx, cy, r, startAngle, endAngle)}
                  fill={colors[i]}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={18}
                  fill="#fff"
                  fontWeight="bold"
                  style={{ textShadow: "0 1px 2px #0006" }}
                >
                  {percent}%
                </text>
              </g>
            );
          });
        })()}
      </svg>
      {/* Legend underneath */}
      <div className="grid grid-cols-2 justify-center gap-8 mt-8">
        {labels.map((label, i) => (
          <div className="flex items-center gap-2" key={label}>
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ background: colors[i] }}
            ></span>
            <span className="text-xs text-[rgb(var(--color-muted))]">
              {label} ({((data[i] / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
