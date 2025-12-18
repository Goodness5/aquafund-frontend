"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../../services/store/authStore";
import { Button } from "../../_components/Button";
import { PencilIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function NGOProfilePage() {
  const router = useRouter();
  const { user, ngo, isAuthenticated, loadFromStorage, getNGOStatus } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    setLoading(false);
  }, [loadFromStorage]);

  const ngoStatus = getNGOStatus();
  const isApproved = ngoStatus === "APPROVED";
  const isPending = ngoStatus === "PENDING";
  const isRejected = ngoStatus === "REJECTED";

  if (loading) {
    return (
      <div className="w-full max-w-full min-w-0">
        <div className="text-[#475068]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2">NGO Profile</h1>
          <p className="text-sm lg:text-base text-[#475068]">Manage your NGO information</p>
        </div>
        {!ngo && (
          <Link href="/ngo/get-started">
            <Button
              size="lg"
              rounded="full"
              className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300"
            >
              Set Up NGO Profile
            </Button>
          </Link>
        )}
      </div>

      {!ngo ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[#475068] text-lg mb-4">You haven't set up your NGO profile yet.</p>
          <Link href="/ngo/get-started">
            <Button
              size="lg"
              rounded="full"
              className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300"
            >
              Get Started
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`rounded-xl p-4 ${
            isApproved ? "bg-green-50 border-2 border-green-200" :
            isPending ? "bg-yellow-50 border-2 border-yellow-200" :
            "bg-red-50 border-2 border-red-200"
          }`}>
            <div className="flex items-center gap-3">
              {isApproved && <CheckCircleIcon className="w-6 h-6 text-green-600" />}
              {isPending && <ClockIcon className="w-6 h-6 text-yellow-600" />}
              {isRejected && <XCircleIcon className="w-6 h-6 text-red-600" />}
              <div>
                <p className={`font-semibold ${
                  isApproved ? "text-green-800" :
                  isPending ? "text-yellow-800" :
                  "text-red-800"
                }`}>
                  {isApproved ? "Profile Approved" : isPending ? "Under Review" : "Profile Rejected"}
                </p>
                <p className={`text-sm ${
                  isApproved ? "text-green-700" :
                  isPending ? "text-yellow-700" :
                  "text-red-700"
                }`}>
                  {isApproved 
                    ? "Your NGO profile is active and you can create fundraisers."
                    : isPending
                    ? "Your profile is being reviewed. We'll notify you once it's approved."
                    : "Your profile was rejected. Please update and resubmit."}
                </p>
              </div>
            </div>
          </div>

          {/* NGO Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#001627]">Organization Details</h2>
              {(isRejected || !isApproved) && (
                <Link href="/ngo/get-started">
                  <Button
                    size="default"
                    rounded="full"
                    className="bg-[#0350B5] text-white hover:bg-[#034093] flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#475068] mb-1">Organization Name</p>
                <p className="text-[#001627] font-medium">{ngo.organizationName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-[#475068] mb-1">Year Established</p>
                <p className="text-[#001627] font-medium">{ngo.yearEstablished || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-[#475068] mb-1">Country of Operation</p>
                <p className="text-[#001627] font-medium">{ngo.countryOfOperation || ngo.orgCountryOfOperation || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-[#475068] mb-1">Email Address</p>
                <p className="text-[#001627] font-medium">{ngo.emailAddress || ngo.orgEmailAddress || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

