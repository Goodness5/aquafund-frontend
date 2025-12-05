"use client";

import { useState } from "react";
import { XMarkIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface VerificationBannerProps {
  isVerified?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
}

export default function VerificationBanner({ isVerified = false, status }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  // If verified, don't show banner (user is already approved)
  if (isVerified || status === "APPROVED") {
    return null;
  }

  // Handle rejected status
  if (status === "REJECTED") {
    return (
      <div className="bg-red-50 border-2 border-red-200 text-red-900 rounded-xl p-4 mb-6 flex items-start gap-3">
        <ExclamationTriangleIcon className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm lg:text-base">Verification Rejected</p>
          <p className="text-xs lg:text-sm mt-1">
            Your NGO profile was rejected. Please update your profile and resubmit for review.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/ngo/setup?rejected=true")}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Update Profile
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Default: PENDING status
  return (
    <div className="bg-[#F7A11A] text-[#7A4A00] rounded-xl p-4 mb-6 flex items-start gap-3">
      <ClockIcon className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm lg:text-base">Verification Pending</p>
        <p className="text-xs lg:text-sm mt-1">
          Your account is currently under review. We&apos;ll notify you once verification is complete (usually within 24-48 hours).
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="hover:opacity-80 transition-opacity flex-shrink-0"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

