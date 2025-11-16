"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function MobileWarningModal() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the modal
    const hasDismissed = localStorage.getItem("dashboard-mobile-warning-dismissed");
    if (hasDismissed === "true") {
      setDismissed(true);
      return;
    }

    // Check if device is mobile
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      if (isMobile && !dismissed) {
        setShowModal(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [dismissed]);

  const handleDismiss = () => {
    setShowModal(false);
    setDismissed(true);
    localStorage.setItem("dashboard-mobile-warning-dismissed", "true");
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#001627]">Mobile View</h2>
          <button
            onClick={handleDismiss}
            className="text-[#475068] hover:text-[#001627] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-[#475068] mb-6">
          For the best experience, we recommend using a larger screen (tablet or desktop) to view the dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 bg-[#0350B5] text-white rounded-full hover:bg-[#034093] transition-colors font-medium"
          >
            View Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

