import React from "react";

const size = 70; // px
const strokeWidth = 8;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const CircularProgress = ({ progress = 0, color = "#16a34a" }) => {
  const offset = Math.max(
    circumference - (Math.min(progress, 100) / 100) * circumference,
    0
  );
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#6b7280" // Tailwind gray-500
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="1rem"
        fill="rgb(var(--color-muted))"
        fontWeight="bold"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default CircularProgress;
