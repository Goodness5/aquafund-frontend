"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { isAddress } from "viem";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  IdentificationIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import externalContracts from "../../../contracts/externalContracts";
import AquaFundRegistryAbi from "../../../contracts/abis/AquaFundRegistry.json";
import Image from "next/image";

interface NGO {
  id: string;
  organizationName: string;
  yearEstablished: number;
  countryOfOperation: string;
  ngoIdentificationNumber: string;
  emailAddress: string;
  missionStatement: string;
  websiteOrSocialLinks: string;
  contactPersonName: string;
  contactPersonPosition: string;
  contactPersonPhoneNumber: string;
  contactPersonResidentialAddress: string;
  contactPersonEmailAddress: string;
  orgCountryOfOperation: string;
  orgEmailAddress: string;
  orgDescription: string;
  orgImages: string[];
  connectedWallet: string;
  statusVerification: "PENDING" | "APPROVED" | "REJECTED";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const formatAddress = (address: `0x${string}`) => {
  if (!isAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function NGODetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const ngoId = params.id as string;

  const [ngo, setNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Get DEFAULT_ADMIN_ROLE and VIEWER_ROLE constants
  const { data: adminRole } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: viewerRole } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "VIEWER_ROLE",
  });

  // Check if connected wallet has admin role
  const { data: hasAdminRole, isLoading: isLoadingAdminRole } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "hasRole",
    args: [
      (adminRole as `0x${string}`) || "0x0000000000000000000000000000000000000000000000000000000000000000",
      address || "0x",
    ],
    query: {
      enabled: !!address && !!adminRole,
    },
  });

  useEffect(() => {
    if (ngoId) {
      fetchNGO();
    }
  }, [ngoId]);

  useEffect(() => {
    if (isConfirmed && approvingId && ngo) {
      handleApproveBackend(approvingId, hash!);
      setApprovingId(null);
    }
  }, [isConfirmed, hash, approvingId, ngo]);


  const fetchNGO = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ngos/${ngoId}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to fetch NGO:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        toast.error(errorData.error || "Failed to fetch NGO details");
        return;
      }

      const data = await res.json();
      console.log("Fetched NGO data:", data);
      
      // Handle different response formats
      // Backend might return { success: true, data: {...} } or just {...}
      const ngoData = data.data || data;
      
      if (!ngoData || !ngoData.id) {
        console.error("Invalid NGO data format:", ngoData);
        toast.error("Invalid NGO data received");
        return;
      }
      
      setNgo(ngoData);
    } catch (error) {
      console.error("Failed to fetch NGO:", error);
      toast.error("Failed to fetch NGO details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!hasAdminRole) {
      toast.error("You don't have admin permissions");
      return;
    }

    if (!viewerRole || !ngo) {
      toast.error("Unable to get VIEWER_ROLE. Please try again.");
      return;
    }

    try {
      setApprovingId(ngo.id);
      
      // Call smart contract to grant VIEWER_ROLE to the NGO
      writeContract({
        address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
        abi: AquaFundRegistryAbi,
        functionName: "grantRole",
        args: [
          viewerRole as `0x${string}`,
          ngo.connectedWallet as `0x${string}`,
        ],
      });
    } catch (error) {
      console.error("Failed to approve:", error);
      setApprovingId(null);
      toast.error("Failed to approve NGO on-chain");
    }
  };

  const handleApproveBackend = async (ngoId: string, txHash: string) => {
    try {
      // Get auth token for authentication
      // Check multiple possible token keys
      const token = typeof window !== "undefined" 
        ? localStorage.getItem("access_token") || 
          localStorage.getItem("token") ||
          (() => {
            try {
              const authStorage = localStorage.getItem("auth-storage");
              if (authStorage) {
                const parsed = JSON.parse(authStorage);
                return parsed?.state?.token || parsed?.token || null;
              }
            } catch {
              return null;
            }
            return null;
          })()
        : null;
      
      console.log("Token found:", !!token);
      
      // Update statusVerification to APPROVED using PUT request
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("Authorization header added");
      } else {
        console.warn("No token found in localStorage. Available keys:", Object.keys(localStorage));
      }
      
      const res = await fetch(`/api/v1/ngos/${ngoId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          statusVerification: "APPROVED",
        }),
      });

      if (res.ok) {
        toast.success("NGO approved successfully");
        fetchNGO(); // Refresh NGO data
        router.push("/ngos");
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update backend");
      }
    } catch (error) {
      console.error("Failed to update backend:", error);
      toast.error("NGO approved on-chain but failed to update backend. Please update manually.");
    }
  };

  const handleReject = async () => {
    if (!ngo) return;
    
    if (!confirm(`Are you sure you want to reject ${ngo.organizationName}?`)) {
      return;
    }

    try {
      // Update statusVerification to REJECTED using PUT request
      const res = await fetch(`/api/v1/ngos/${ngo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusVerification: "REJECTED",
        }),
      });

      if (res.ok) {
        toast.success("NGO rejected successfully");
        fetchNGO(); // Refresh NGO data
        router.push("/ngos");
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reject NGO");
      }
    } catch (error) {
      console.error("Failed to reject:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reject NGO";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5] mb-4"></div>
        <p className="text-gray-500">Loading NGO details...</p>
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500 mb-2">NGO not found</p>
        <p className="text-sm text-gray-400 mb-4">ID: {ngoId}</p>
        <button
          onClick={() => router.push("/ngos")}
          className="px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093]"
        >
          Back to NGOs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/ngos")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ngo.organizationName}</h1>
            <p className="text-sm text-gray-500">NGO Details</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div>
          {ngo.statusVerification === "PENDING" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
              <ClockIcon className="h-4 w-4" />
              Pending
            </span>
          )}
          {ngo.statusVerification === "APPROVED" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
              <CheckCircleIcon className="h-4 w-4" />
              Approved
            </span>
          )}
          {ngo.statusVerification === "REJECTED" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
              <XCircleIcon className="h-4 w-4" />
              Rejected
            </span>
          )}
        </div>
      </div>

      {/* Admin Warnings */}
      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please connect your wallet to approve NGOs
          </p>
        </div>
      )}

      {isConnected && !isLoadingAdminRole && hasAdminRole === false && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Your wallet does not have admin permissions
          </p>
        </div>
      )}
      
      {isConnected && isLoadingAdminRole && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Checking admin permissions...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Images */}
          {ngo.orgImages && ngo.orgImages.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ngo.orgImages.map((imageUrl, idx) => (
                  <div key={idx} className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={imageUrl}
                      alt={`Organization image ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organization Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              Organization Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Organization Name</label>
                <p className="text-sm text-gray-900 mt-1">{ngo.organizationName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Year Established</label>
                  <p className="text-sm text-gray-900 mt-1">{ngo.yearEstablished}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country of Operation</label>
                  <p className="text-sm text-gray-900 mt-1">{ngo.countryOfOperation || ngo.orgCountryOfOperation}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">NGO Identification Number</label>
                <p className="text-sm text-gray-900 mt-1">{ngo.ngoIdentificationNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mission Statement</label>
                <p className="text-sm text-gray-900 mt-1">{ngo.missionStatement || ngo.orgDescription}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4" />
                  Website / Social Links
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {ngo.websiteOrSocialLinks ? (
                    <a href={ngo.websiteOrSocialLinks} target="_blank" rel="noopener noreferrer" className="text-[#0350B5] hover:underline">
                      {ngo.websiteOrSocialLinks}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-sm text-gray-900 mt-1">{ngo.emailAddress || ngo.orgEmailAddress}</p>
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Contact Person Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900 mt-1">{ngo.contactPersonName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-sm text-gray-900 mt-1">{ngo.contactPersonPosition}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </label>
                <p className="text-sm text-gray-900 mt-1">{ngo.contactPersonEmailAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="text-sm text-gray-900 mt-1">{ngo.contactPersonPhoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Residential Address
                </label>
                <p className="text-sm text-gray-900 mt-1">{ngo.contactPersonResidentialAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5" />
              Wallet Information
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-500">Connected Wallet</label>
              <p className="text-sm text-gray-900 mt-1 font-mono break-all">
                {formatAddress(ngo.connectedWallet as `0x${string}`)}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div>
                <label className="text-gray-500">User ID</label>
                <p className="text-gray-900 mt-1">{ngo.userId}</p>
              </div>
              <div>
                <label className="text-gray-500">Created At</label>
                <p className="text-gray-900 mt-1">
                  {new Date(ngo.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Updated At</label>
                <p className="text-gray-900 mt-1">
                  {new Date(ngo.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {ngo.statusVerification === "PENDING" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={!isConnected || hasAdminRole === false || isLoadingAdminRole || approvingId === ngo.id || isWriting || isConfirming}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title={
                    !isConnected 
                      ? "Please connect your wallet" 
                      : hasAdminRole === false 
                      ? "You don't have admin permissions"
                      : isLoadingAdminRole
                      ? "Checking admin permissions..."
                      : approvingId === ngo.id || isWriting || isConfirming
                      ? "Processing approval..."
                      : "Approve NGO"
                  }
                >
                  {approvingId === ngo.id && (isWriting || isConfirming) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Approve NGO
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Reject NGO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

