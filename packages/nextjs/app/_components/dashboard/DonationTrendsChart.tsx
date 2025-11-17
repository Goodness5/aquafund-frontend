"use client";

import { useState, useMemo, useEffect } from "react";
import DateRangeDropdown from "./DateRangeDropdown";

// Mock data generator based on date range
const generateDataForRange = (range: string) => {
  // Different data patterns for different ranges
  const dataPatterns: Record<string, { data: number[]; previous: number[] }> = {
    "Last 7 Days": {
      data: [5000, 3000, -2000, 2000, 5000, 8000, 12000, 22000, 15000, 18000, 20000, 20000],
      previous: [0, 2000, 5000, 8000, 12000, -1000, 5000, 10000, 15000, 20000, 25000, 30000],
    },
    "Last 30 Days": {
      data: [8000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 24000, 20000, 18000, 16000],
      previous: [5000, 8000, 10000, 12000, 15000, 18000, 20000, 22000, 20000, 18000, 15000, 12000],
    },
    "Last 90 Days": {
      data: [10000, 15000, 20000, 25000, 28000, 30000, 32000, 30000, 28000, 25000, 22000, 20000],
      previous: [8000, 12000, 18000, 22000, 25000, 28000, 30000, 28000, 26000, 24000, 22000, 20000],
    },
    "Last 6 Months": {
      data: [12000, 18000, 25000, 30000, 35000, 40000, 38000, 35000, 32000, 30000, 28000, 25000],
      previous: [10000, 15000, 22000, 28000, 32000, 38000, 36000, 34000, 32000, 30000, 28000, 26000],
    },
    "Last Year": {
      data: [15000, 22000, 30000, 38000, 45000, 50000, 48000, 45000, 42000, 40000, 38000, 35000],
      previous: [12000, 20000, 28000, 35000, 42000, 48000, 46000, 44000, 42000, 40000, 38000, 36000],
    },
    "All Time": {
      data: [20000, 30000, 40000, 50000, 60000, 70000, 68000, 65000, 62000, 60000, 58000, 55000],
      previous: [18000, 28000, 38000, 48000, 58000, 68000, 66000, 64000, 62000, 60000, 58000, 56000],
    },
  };

  return dataPatterns[range] || dataPatterns["Last 7 Days"];
};

export default function DonationTrendsChart() {
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [isLoading, setIsLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const chartData = useMemo(() => generateDataForRange(dateRange), [dateRange]);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const maxValue = Math.max(...chartData.data, ...chartData.previous);
  const minValue = Math.min(...chartData.data, ...chartData.previous);
  const valueRange = maxValue - minValue;
  const chartHeight = 300;
  const chartWidth = 1000;

  // Animate on date range change
  useEffect(() => {
    setIsLoading(true);
    setAnimationKey(prev => prev + 1);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [dateRange]);

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-inner flex flex-col h-full w-full transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-[#001627]">Donation Trends</h3>
        <DateRangeDropdown value={dateRange} onChange={setDateRange} />
      </div>

      <div className="relative w-full flex-1" style={{ minHeight: chartHeight }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0350B5]"></div>
          </div>
        )}
        <svg 
          key={animationKey}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-full transition-opacity duration-300" 
          preserveAspectRatio="xMidYMid meet"
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          {/* Y-axis labels */}
          {[0, 10, 20, 30].map((val) => {
            const yPos = chartHeight - ((val * 1000 - minValue) / valueRange) * (chartHeight - 40) - 20;
            return (
              <g key={val}>
                <text
                  x={10}
                  y={yPos}
                  className="text-xs fill-[#475068]"
                >
                  {val}K
                </text>
                <line
                  x1={40}
                  y1={yPos}
                  x2={chartWidth}
                  y2={yPos}
                  stroke="#E0E7EF"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              </g>
            );
          })}

          {/* Area under solid line (drawn first so line appears on top) */}
          <polygon
            points={`40,${chartHeight - ((0 - minValue) / valueRange) * (chartHeight - 40) - 20} ${chartData.data.map((val, i) => {
              const x = 40 + (i / (months.length - 1)) * (chartWidth - 60);
              const y = chartHeight - ((val - minValue) / valueRange) * (chartHeight - 40) - 20;
              return `${x},${y}`;
            }).join(" ")} ${chartWidth - 20},${chartHeight - ((0 - minValue) / valueRange) * (chartHeight - 40) - 20}`}
            fill="#CAC4D0"
            fillOpacity="0.2"
            style={{ transition: "all 0.5s ease-in-out" }}
          />

          {/* Solid trend line (dark grey) */}
          <polyline
            points={chartData.data.map((val, i) => {
              const x = 40 + (i / (months.length - 1)) * (chartWidth - 60);
              const y = chartHeight - ((val - minValue) / valueRange) * (chartHeight - 40) - 20;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="#475068"
            strokeWidth="2"
            style={{ transition: "all 0.5s ease-in-out" }}
          />

          {/* Dashed trend line (light blue) */}
          <polyline
            points={chartData.previous.map((val, i) => {
              const x = 40 + (i / (months.length - 1)) * (chartWidth - 60);
              const y = chartHeight - ((val - minValue) / valueRange) * (chartHeight - 40) - 20;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="#5EE7FF"
            strokeWidth="2"
            strokeDasharray="6,4"
            style={{ transition: "all 0.5s ease-in-out" }}
          />

          {/* X-axis labels */}
          {months.map((month, i) => {
            const x = 40 + (i / (months.length - 1)) * (chartWidth - 60);
            return (
              <text
                key={month}
                x={x}
                y={chartHeight - 5}
                className="text-xs fill-[#475068]"
                textAnchor="middle"
              >
                {month}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

