"use client";

import { useReadContract } from "wagmi";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import externalContracts from "../../contracts/externalContracts";
import AquaFundRegistryAbi from "../../contracts/abis/AquaFundRegistry.json";
import AquaFundFactoryAbi from "../../contracts/abis/AquaFundFactory.json";

export default function AnalyticsPage() {
  // Get platform stats from Registry
  const { data: platformStats, isLoading: loadingStats } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "getPlatformStats",
  });

  // Get factory stats
  const { data: totalProjects } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getTotalProjects",
  });

  const { data: totalDonors } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getTotalDonors",
  });

  const { data: totalFundsRaised } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "totalFundsRaised",
  });

  const stats = platformStats as any;

  const statCards = [
    {
      name: "Total Projects",
      value: totalProjects ? totalProjects.toString() : "0",
      icon: BuildingOfficeIcon,
      color: "bg-blue-500",
    },
    {
      name: "Active Projects",
      value: stats ? stats.activeProjects?.toString() || "0" : "0",
      icon: ChartBarIcon,
      color: "bg-green-500",
    },
    {
      name: "Total Funds Raised",
      value: totalFundsRaised
        ? `${(Number(totalFundsRaised) / 1e18).toFixed(2)} ETH`
        : "0 ETH",
      icon: CurrencyDollarIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Total Donors",
      value: totalDonors ? totalDonors.toString() : "0",
      icon: UserGroupIcon,
      color: "bg-purple-500",
    },
    {
      name: "Completed Projects",
      value: stats ? stats.completedProjects?.toString() || "0" : "0",
      icon: BuildingOfficeIcon,
      color: "bg-indigo-500",
    },
    {
      name: "Total Donations",
      value: stats ? stats.totalDonations?.toString() || "0" : "0",
      icon: CurrencyDollarIcon,
      color: "bg-pink-500",
    },
  ];

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of platform performance and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Analytics Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Funded Projects</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.fundedProjects?.toString() || "0" : "0"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Funds (Registry)</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats
                ? `${((Number(stats.totalFundsRaised) || 0) / 1e18).toFixed(2)} ETH`
                : "0 ETH"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

