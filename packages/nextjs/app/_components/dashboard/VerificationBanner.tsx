"use client";

import { useState } from "react";
import { XMarkIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface VerificationBannerProps {
  isVerified?: boolean;
}

export default function VerificationBanner({ isVerified = false }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (isVerified) {
    return (
      <div className="bg-[#00BF3C] text-white rounded-xl p-4 mb-6 flex items-start gap-3">
        <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm lg:text-base">Verified!</p>
          <p className="text-xs lg:text-sm opacity-90 mt-1">
            Your account is now verified! You can now receive donations from donors around the world.
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

  return (
    <div className="bg-[#F7A11A] text-[#7A4A00] rounded-xl p-4 mb-6 flex items-start gap-3">
      <ClockIcon className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm lg:text-base">Verification Pending</p>
        <p className="text-xs lg:text-sm mt-1">
          Your account is currently under review. We'll notify you once verification is complete (usually within 24-48 hours).
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

