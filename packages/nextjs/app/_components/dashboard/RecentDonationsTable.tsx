"use client";

import { useState, useMemo, useEffect } from "react";
import { LinkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import DateRangeDropdown from "./DateRangeDropdown";

interface Donation {
  transactionId: string;
  amount: string;
  asset: string;
  date: string;
  comments: string;
}

// Mock data generator based on date range
const generateDonationsForRange = (range: string): Donation[] => {
  const baseDonations: Donation[] = [
    {
      transactionId: "0x742d3e4v97hd734123190jc8335f0b",
      amount: "$600",
      asset: "USDC",
      date: "01/01/2025 20:40",
      comments: "My goodwill is with...",
    },
    {
      transactionId: "0x8a3f2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f",
      amount: "$1,200",
      asset: "USDT",
      date: "01/02/2025 14:20",
      comments: "Keep up the great work!",
    },
    {
      transactionId: "0x9b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b",
      amount: "$450",
      asset: "DAI",
      date: "01/03/2025 09:15",
      comments: "Supporting the cause",
    },
    {
      transactionId: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
      amount: "$800",
      asset: "USDC",
      date: "01/04/2025 16:30",
      comments: "Every bit helps!",
    },
    {
      transactionId: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      amount: "$1,500",
      asset: "BTC",
      date: "01/05/2025 11:45",
      comments: "Amazing project!",
    },
  ];

  // Return different amounts based on range
  const rangeMultipliers: Record<string, number> = {
    "Last 7 Days": 1,
    "Last 30 Days": 2,
    "Last 90 Days": 3,
    "Last 6 Months": 4,
    "Last Year": 5,
    "All Time": 6,
  };

  const multiplier = rangeMultipliers[range] || 1;
  return Array.from({ length: baseDonations.length * multiplier }, (_, i) => ({
    ...baseDonations[i % baseDonations.length],
    transactionId: `${baseDonations[i % baseDonations.length].transactionId}${i}`,
  })).slice(0, 10); // Limit to 10 for display
};

export default function RecentDonationsTable() {
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [isLoading, setIsLoading] = useState(false);

  const donations = useMemo(() => generateDonationsForRange(dateRange), [dateRange]);

  // Animate on date range change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [dateRange]);

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-[#001627]">Recent Donations</h3>
          <DateRangeDropdown value={dateRange} onChange={setDateRange} />
        </div>
        <div className="text-center py-12 text-[#475068]">
          You haven&apos;t received any donation yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-inner transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-[#001627]">Recent Donations</h3>
        <DateRangeDropdown value={dateRange} onChange={setDateRange} />
      </div>

      <div className="overflow-x-auto -mx-4 lg:mx-0 relative scrollbar-hide">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0350B5]"></div>
          </div>
        )}
        <div className="inline-block min-w-full px-4 lg:px-0">
          <table className="w-full min-w-[600px] max-w-full">
            <thead>
              <tr className="border-b border-[#CAC4D0]">
                <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-semibold text-[#001627]">Transaction id</th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-semibold text-[#001627]">Amount</th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-semibold text-[#001627]">Asset</th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-semibold text-[#001627]">Date</th>
                <th className="text-left py-3 px-2 lg:px-4 text-xs lg:text-sm font-semibold text-[#001627]">Comments</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation, index) => (
                <tr 
                  key={`${donation.transactionId}-${index}`} 
                  className="border-b border-[#E0E7EF] hover:bg-[#F5F5F5] transition-all duration-200"
                  style={{ 
                    animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                    opacity: isLoading ? 0.5 : 1 
                  }}
                >
                  <td className="py-3 px-2 lg:px-4">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3 h-3 lg:w-4 lg:h-4 text-[#475068]" />
                      <span className="text-xs lg:text-sm text-[#001627] font-mono truncate max-w-[120px] lg:max-w-none">{donation.transactionId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm font-semibold text-[#001627]">{donation.amount}</td>
                  <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm text-[#475068]">{donation.asset}</td>
                  <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm text-[#475068]">{donation.date}</td>
                  <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm text-[#475068] truncate max-w-[100px] lg:max-w-none">{donation.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link href="/dashboard/donations" className="text-[#0350B5] hover:underline text-sm font-medium">
          View All
        </Link>
      </div>
    </div>
  );
}

