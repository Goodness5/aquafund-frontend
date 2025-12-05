"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, ArrowRightIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import { useAuthStore } from "../../../services/store/authStore";

const AUTH_TOKEN_KEY = "access_token";

function AccountUnderReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectTitle = searchParams.get("project");
  const { user, isAuthenticated, loadFromStorage, setAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  // Load auth from storage on mount (only once)
  useEffect(() => {
    loadFromStorage();
  }, []); // Empty deps - only run once on mount

  // Fetch fresh user data from API (including NGO status)
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
        // Handle response format: { success: true, data: { id, email, ..., ngo: {...} } }
        // NGO is nested inside the user data object
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

  // Check NGO status on mount and periodically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkNGOStatus = async () => {
      // Wait for auth to load
      await new Promise(resolve => setTimeout(resolve, 300));

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const currentIsAuthenticated = authState.isAuthenticated;

      if (!currentIsAuthenticated || !currentUser || !token) {
        router.push("/accounts/sign-in?return=" + encodeURIComponent("/accounts/under-review"));
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      console.log("Fetching user data for status check...");

      // Fetch fresh data from backend
      const freshData = await fetchUserData(currentUser.id, token);

      if (freshData) {
        const { ngo: freshNGO } = freshData;
        console.log("Fresh NGO data:", freshNGO);
        
        // Check NGO status with fresh data from backend
        // Handle both statusVerification (from backend) and status (mapped)
        const ngoStatus = freshNGO?.status || freshNGO?.statusVerification;
        console.log("NGO Status:", ngoStatus);

        if (ngoStatus === "APPROVED") {
          // NGO has been approved - redirect to dashboard
          console.log("NGO approved, redirecting to dashboard");
          router.replace("/dashboard");
          return;
        } else if (ngoStatus === "REJECTED") {
          // NGO was rejected - redirect to NGO creation to resubmit
          console.log("NGO rejected, redirecting to NGO creation");
          router.replace("/dashboard/ngo/setup?rejected=true");
          return;
        } else if (!freshNGO || freshNGO === null) {
          // No NGO - redirect to creation
          console.log("No NGO found, redirecting to NGO creation");
          router.replace("/dashboard/ngo/setup");
          return;
        }
        // If still PENDING, stay on this page
        console.log("NGO still pending, staying on page");
      } else {
        console.log("Failed to fetch fresh data");
      }

      setIsChecking(false);
      setHasCheckedStatus(true);
    };

    // Run check immediately on mount
    checkNGOStatus();

    // Set up periodic check every 30 seconds to see if status changed
    const interval = setInterval(() => {
      checkNGOStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [router, setAuth]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleViewFundraiser = () => {
    if (projectTitle) {
      router.push(`/dashboard/fundraisers/create?project=${encodeURIComponent(projectTitle)}`);
    } else {
      router.push("/dashboard/fundraisers/create");
    }
  };

  // Show loading while checking status
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914] flex items-center justify-center p-4">
        <div className="text-[#475068]">Checking status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914] flex items-center justify-center p-4">
      <div className="">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#00BF3C] flex items-center justify-center">
            <CheckCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-[#E1FFFF]" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#001627] text-center mb-4">
          Your account is under review!
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-[#475068] text-center mb-8">
          You&apos;ll be notified once verification is complete. Meanwhile, continue editing your fundraiser or explore active projects.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 w-1/2 m-auto">
          <Button
            onClick={handleGoToDashboard}
            size="lg"
            rounded="full"
            className="flex-1 bg-gradient-to-r from-[#0350B5] text-nowrap to-[#1BCBEE] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="text-nowrap">Go to Dashboard</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleViewFundraiser}
            size="lg"
            rounded="full"
            variant="link"
            className="border-2 border-[#0350B5] text-[#0350B5] hover:bg-[#E1FFFF] transition-colors flex items-center justify-center gap-2 text-nowrap "
          >
            <PencilIcon className="w-5 h-5" />
            <span className="text-nowrap">View Fundraiser Progress</span>
          </Button>
        </div>

        {/* What Happens Next Section */}
        <div className="border-t border-[#CAC4D0] pt-8 bg-white rounded-3xl p-8 sm:p-12 justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#001627] mb-6 text-center">
            What Happens Next?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-between w-full">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0350B5] flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
              </div>
              <p className="text-sm sm:text-base text-[#475068]">
                Review Process
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center w-full  p-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00BF3C] flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
              </div>
              <p className="text-sm sm:text-base text-[#475068]">
                Verification
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center w-full p-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1BCBEE] flex items-center justify-center mb-3">
                <span className="text-2xl sm:text-3xl font-bold text-white">3</span>
              </div>
              <p className="text-sm sm:text-base text-[#475068]">
                Approval
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountUnderReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914] flex items-center justify-center p-4">
        <div className="text-[#475068]">Loading...</div>
      </div>
    }>
      <AccountUnderReviewContent />
    </Suspense>
  );
}

