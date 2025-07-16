import React from "react";

const size = 66; // px
const strokeWidth = 6;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const CircularProgress = ({ progress = 0, color = "#22c55e" }) => {
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb" // Tailwind gray-200
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
