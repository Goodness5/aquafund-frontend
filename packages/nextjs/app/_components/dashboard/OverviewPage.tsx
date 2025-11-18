"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { FadeInSection } from "../FadeInSection";
import VerificationBanner from "./VerificationBanner";
import MetricsCards from "./MetricsCards";

// Lazy load heavy components
const DonationTrendsChart = lazy(() => import("./DonationTrendsChart"));
const DonationSourcesChart = lazy(() => import("./DonationSourcesChart"));
const RecentDonationsTable = lazy(() => import("./RecentDonationsTable"));
const ActiveFundraiser = lazy(() => import("./ActiveFundraiser"));

// Loading skeleton component
const ChartSkeleton = () => (
  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-inner flex flex-col h-full w-full animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="flex-1 bg-gray-100 rounded"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-inner animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded"></div>
      ))}
    </div>
  </div>
);

export default function OverviewPage() {
  return (
    <div className="w-full max-w-full min-w-0">
      {/* Verification Banner */}
      <FadeInSection delay={0}>
        <VerificationBanner isVerified={false} />
      </FadeInSection>

      {/* Header Section */}
      <FadeInSection delay={100}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2">Overview</h1>
            <p className="text-sm lg:text-base text-[#475068]">Overview of your fundraising activities</p>
          </div>
          <Link
            href="/dashboard/fundraisers/create"
            className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-[#0350B5] text-white rounded-full hover:bg-[#034093] transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm lg:text-base w-full lg:w-auto shadow-md hover:shadow-lg"
          >
            Create Fundraiser
            <ArrowUpRightIcon className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </FadeInSection>

      {/* Metrics Cards */}
      <FadeInSection delay={200}>
        <MetricsCards />
      </FadeInSection>

      {/* Charts Row */}
      <FadeInSection delay={300}>
        <div className="flex flex-col lg:flex-row gap-6 mb-6 lg:items-stretch min-w-0">
          <div className="w-full flex min-w-0">
            <Suspense fallback={<ChartSkeleton />}>
              <DonationTrendsChart />
            </Suspense>
          </div>
          <div className="w-1/2 flex min-w-0">
            <Suspense fallback={<ChartSkeleton />}>
              <DonationSourcesChart />
            </Suspense>
          </div>
        </div>
      </FadeInSection>

      {/* Active Fundraiser */}
      <FadeInSection delay={400}>
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-[#001627] mb-4">Active Fundraiser</h2>
          <Suspense fallback={<div className="bg-white rounded-xl p-6 shadow-inner animate-pulse h-48"></div>}>
            <ActiveFundraiser />
          </Suspense>
        </div>
      </FadeInSection>

      {/* Recent Donations */}
      <FadeInSection delay={500}>
        <Suspense fallback={<TableSkeleton />}>
          <RecentDonationsTable />
        </Suspense>
      </FadeInSection>
    </div>
  );
}

