"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../services/store/authStore";
import Link from "next/link";

interface NGOGuardProps {
  children: React.ReactNode;
  requireApproved?: boolean; // If true, requires APPROVED status. If false, just requires NGO exists
}

export function NGOGuard({ children, requireApproved = true }: NGOGuardProps) {
  const router = useRouter();
  const { user, ngo, isAuthenticated, hasApprovedNGO, hasNGO, getNGOStatus } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/accounts/sign-in");
      return;
    }

    // Small delay to ensure state is stable
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      // If requireApproved is true, check for approved NGO
      if (requireApproved) {
        if (!hasApprovedNGO()) {
          // No NGO or not approved - redirect based on status
          if (!hasNGO()) {
            // No NGO at all - redirect to creation
            router.replace("/dashboard/ngo/setup");
            return;
          } else {
            // Check status (handle both status and statusVerification)
            const ngoStatus = getNGOStatus();
            if (ngoStatus === "PENDING") {
              // NGO is pending - redirect to under review
              router.replace("/accounts/under-review");
              return;
            } else if (ngoStatus === "REJECTED") {
              // NGO was rejected - redirect to creation with rejected flag
              router.replace("/dashboard/ngo/setup?rejected=true");
              return;
            }
          }
        }
      } else {
        // Just require NGO exists (for pages that need NGO but not necessarily approved)
        if (!hasNGO()) {
          router.replace("/ngo/get-started");
          return;
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, ngo, requireApproved, router, hasApprovedNGO, hasNGO, getNGOStatus]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#475068]">Loading...</div>
      </div>
    );
  }

  // Show loading while redirecting (redirects happen in useEffect above)
  // If we reach here and still don't have approved NGO, show message as fallback
  if (requireApproved && !hasApprovedNGO() && !isChecking) {
    if (!hasNGO()) {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#001627] mb-4">
              NGO Profile Required
            </h2>
            <p className="text-[#475068] mb-6">
              You need to create an NGO profile before accessing this page.
            </p>
            <Link
              href="/dashboard/ngo/setup"
              className="inline-block bg-[#0350B5] text-white px-6 py-3 rounded-lg hover:bg-[#034093] transition-colors font-medium"
            >
              Create NGO Profile
            </Link>
          </div>
        </div>
      );
    }

    // These should have been redirected, but show as fallback
    const ngoStatus = getNGOStatus();
    if (ngoStatus === "PENDING") {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#001627] mb-4">
              Redirecting...
            </h2>
            <p className="text-[#475068] mb-6">
              Your NGO profile is under review. Redirecting you now...
            </p>
          </div>
        </div>
      );
    }

    if (ngoStatus === "REJECTED") {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#001627] mb-4">
              NGO Profile Rejected
            </h2>
            <p className="text-[#475068] mb-6">
              Your NGO profile was rejected. Please update your profile and resubmit for review.
            </p>
            <Link
              href="/dashboard/ngo/setup?rejected=true"
              className="inline-block bg-[#0350B5] text-white px-6 py-3 rounded-lg hover:bg-[#034093] transition-colors font-medium"
            >
              Update NGO Profile
            </Link>
          </div>
        </div>
      );
    }
  }

  if (!requireApproved && !hasNGO() && !isChecking) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#001627] mb-4">
            NGO Profile Required
          </h2>
          <p className="text-[#475068] mb-6">
            You need to create an NGO profile before accessing this page.
          </p>
          <Link
            href="/ngo/get-started"
            className="inline-block bg-[#0350B5] text-white px-6 py-3 rounded-lg hover:bg-[#034093] transition-colors font-medium"
          >
            Create NGO Profile
          </Link>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

