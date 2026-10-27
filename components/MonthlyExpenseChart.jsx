"use client";

import { useState } from "react";

export default function MonthlyExpenseChart({ data }) {
  const [hover, setHover] = useState(null);

  const max = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" /> <span>Expenses</span>
        </div>
      </div>
      <svg viewBox="0 0 120 40" className="w-full h-10" role="img" aria-label="Monthly expenses bar chart">
        {data.map((m, i) => {
          const barW = 12;
          const gap = 4;
          const x = i * (barW + gap) + 6;
          const h = Math.round((m.total / max) * 30);
          const y = 35 - h;
          return (
            <g key={m.key}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="2"
                fill="#16a34a"
                tabIndex={0}
                aria-label={`${m.label}: ₹${m.total.toLocaleString()}`}
                onMouseEnter={(e) => setHover({ x: e.clientX, y: e.clientY, value: m.total, label: m.label })}
                onMouseLeave={() => setHover(null)}
                onFocus={(e) => setHover({ x: e.target.getBoundingClientRect().left, y: e.target.getBoundingClientRect().top, value: m.total, label: m.label })}
                onBlur={() => setHover(null)}
              />
            </g>
          );
        })}
        {data.map((m, i) => {
          const barW = 12;
          const gap = 4;
          const x = i * (barW + gap) + 6;
          return (
            <text key={`t-${m.key}`} x={x + 6} y={38} fontSize="4" textAnchor="middle" fill="#4b5563">{m.label}</text>
          );
        })}
      </svg>

      {hover && (
        <div style={{ position: 'absolute', right: 8, top: 0 }} className="bg-white border rounded px-2 py-1 text-xs shadow-sm">
          <div className="font-semibold">{hover.label}</div>
          <div>₹{hover.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
