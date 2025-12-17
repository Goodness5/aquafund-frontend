"use client";

import { Suspense, lazy, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { FadeInSection } from "../FadeInSection";
import VerificationBanner from "./VerificationBanner";
import MetricsCards from "./MetricsCards";
import { useAuthStore } from "../../../services/store/authStore";

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

const AUTH_TOKEN_KEY = "access_token";

export default function OverviewPage() {
  const router = useRouter();
  const { user, ngo, isAuthenticated, loadFromStorage, setAuth, getNGOStatus } = useAuthStore();
  const [hasNgo, setHasNgo] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Load auth from storage on mount (only once)
    loadFromStorage();
  }, []); // Empty deps - only run once on mount

  // Fetch fresh user data from backend to get current NGO status
  const fetchUserData = async (userId: string, token: string) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const userData = data.data;
          const ngoData = userData.ngo || null;
          
          // Map statusVerification to status for consistency
          if (ngoData && ngoData.statusVerification) {
            ngoData.status = ngoData.statusVerification;
          }
          
          // Update auth store with fresh user data and NGO
          setAuth(userData, token, ngoData);
          return { user: userData, ngo: ngoData };
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };

  // Fetch fresh data on mount (only once)
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isMounted = true;

    const loadFreshData = async () => {
      // Wait for auth to load
      await new Promise(resolve => setTimeout(resolve, 300));

      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const currentIsAuthenticated = authState.isAuthenticated;
      const currentNgo = authState.ngo;

      if (!currentIsAuthenticated || !currentUser) {
        if (isMounted) setIsLoadingStatus(false);
        return;
      }

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (isMounted) {
          setHasNgo(!!currentNgo);
          setIsLoadingStatus(false);
        }
        return;
      }

      if (isMounted) setIsLoadingStatus(true);
      const freshData = await fetchUserData(currentUser.id, token);
      
      if (isMounted) {
        if (freshData) {
          setHasNgo(!!freshData.ngo);
        } else {
          // Fallback to stored data
          setHasNgo(!!currentNgo);
        }
        setIsLoadingStatus(false);
      }
    };

    loadFreshData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Get current NGO status
  const ngoStatus = getNGOStatus();
  const isVerified = ngoStatus === "APPROVED";
  const isPending = ngoStatus === "PENDING";
  const isRejected = ngoStatus === "REJECTED";

  return (
    <div className="w-full max-w-full min-w-0">
      {/* NGO Setup Banner - Show if user doesn't have NGO */}
      {hasNgo === false && (
        <FadeInSection delay={0}>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-[#001627] mb-1">
                    Complete Your NGO Setup
                  </h3>
                  <p className="text-sm text-[#475068]">
                    Set up your NGO profile to start creating fundraisers and receiving donations.
                  </p>
                </div>
              </div>
              <Link
                href="/ngo/get-started"
                className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-[#0350B5] text-white rounded-full hover:bg-[#034093] transition-all duration-300 font-medium text-sm lg:text-base whitespace-nowrap"
              >
                Set Up NGO
                <ArrowUpRightIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              </Link>
            </div>
          </div>
        </FadeInSection>
      )}

      {/* Verification Banner - Only show if PENDING or REJECTED */}
      {!isLoadingStatus && (isPending || isRejected) && (
        <FadeInSection delay={hasNgo === false ? 100 : 0}>
          <VerificationBanner 
            isVerified={isVerified} 
            status={(ngoStatus as "PENDING" | "APPROVED" | "REJECTED") || "PENDING"}
          />
        </FadeInSection>
      )}

      {/* Header Section */}
      <FadeInSection delay={hasNgo === false ? 200 : 100}>
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
      <FadeInSection delay={hasNgo === false ? 300 : 200}>
        <MetricsCards />
      </FadeInSection>

      {/* Charts Row */}
      <FadeInSection delay={hasNgo === false ? 400 : 300}>
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
      <FadeInSection delay={hasNgo === false ? 500 : 400}>
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-[#001627] mb-4">Active Fundraiser</h2>
          <Suspense fallback={<div className="bg-white rounded-xl p-6 shadow-inner animate-pulse h-48"></div>}>
            <ActiveFundraiser />
          </Suspense>
        </div>
      </FadeInSection>

      {/* Recent Donations */}
      <FadeInSection delay={hasNgo === false ? 600 : 500}>
        <Suspense fallback={<TableSkeleton />}>
          <RecentDonationsTable />
        </Suspense>
      </FadeInSection>
    </div>
  );
}

