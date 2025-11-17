"use client";

import { useState, useMemo, useEffect } from "react";
import DateRangeDropdown from "./DateRangeDropdown";

// Mock data generator based on date range
const generateDataForRange = (range: string) => {
  const dataPatterns: Record<string, { crypto: number; bank: number }> = {
    "Last 7 Days": { crypto: 30, bank: 70 },
    "Last 30 Days": { crypto: 35, bank: 65 },
    "Last 90 Days": { crypto: 40, bank: 60 },
    "Last 6 Months": { crypto: 45, bank: 55 },
    "Last Year": { crypto: 50, bank: 50 },
    "All Time": { crypto: 55, bank: 45 },
  };

  return dataPatterns[range] || dataPatterns["Last 7 Days"];
};

export default function DonationSourcesChart() {
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [isLoading, setIsLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const chartData = useMemo(() => generateDataForRange(dateRange), [dateRange]);
  const cryptoPercentage = chartData.crypto;
  const bankTransferPercentage = chartData.bank;
  const radius = 60;
  const centerX = 90;
  const centerY = 90;
  const circumference = 2 * Math.PI * radius;

  // Animate on date range change
  useEffect(() => {
    setIsLoading(true);
    setAnimationKey(prev => prev + 1);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [dateRange]);

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-inner w-full flex flex-col h-full transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-sm font-semibold text-[#001627]">Donation Sources</h3>
        <DateRangeDropdown value={dateRange} onChange={setDateRange} />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0350B5]"></div>
          </div>
        )}
        <svg 
          key={animationKey}
          viewBox="0 0 180 180" 
          className="w-full max-w-[180px] mb-4 transition-opacity duration-300" 
          style={{ height: "auto", opacity: isLoading ? 0.5 : 1 }}
        >
          {/* Crypto segment (darker green) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#00BF3C"
            strokeWidth="24"
            strokeDasharray={`${(cryptoPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${centerX} ${centerY})`}
            style={{ transition: "stroke-dasharray 0.5s ease-in-out" }}
          />
          
          {/* Bank Transfer segment (lighter grey/blue) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#014924"
            strokeWidth="24"
            strokeDasharray={`${(bankTransferPercentage / 100) * circumference} ${circumference}`}
            strokeDashoffset={-((cryptoPercentage / 100) * circumference)}
            transform={`rotate(-90 ${centerX} ${centerY})`}
            style={{ transition: "stroke-dasharray 0.5s ease-in-out" }}
          />
        </svg>

        {/* Legend - no radio buttons, just labels */}
        <div className=" w-full flex justify-center gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#00BF3C]"></div>
            <span className="text-[#001627] text-sm">Crypto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#014924]"></div>
            <span className="text-[#001627] text-sm">Bank Transfers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

