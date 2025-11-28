"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { isAddress } from "viem";
import toast from "react-hot-toast";
import { authenticatedFetch } from "../../utils/api";

const formatAddress = (address: `0x${string}`) => {
  if (!isAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import externalContracts from "../../contracts/externalContracts";
import AquaFundRegistryAbi from "../../contracts/abis/AquaFundRegistry.json";

interface NGO {
  id: string;
  organizationName: string;
  email: string;
  walletAddress: string;
  countryOfOperation: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  documents?: {
    certificateOfRegistration?: string;
    ngoLogo?: string;
    adminIdentityVerification?: string;
  };
}

export default function NGOPage() {
  const { address, isConnected } = useAccount();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [showModal, setShowModal] = useState(false);
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
  const { data: hasAdminRole } = useReadContract({
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
    fetchNGOs();
  }, []);

  useEffect(() => {
    if (isConfirmed && approvingId) {
      handleApproveBackend(approvingId, hash!);
      setApprovingId(null);
    }
  }, [isConfirmed, hash, approvingId]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/api/ngos?status=pending");
      if (res.ok) {
        const data = await res.json();
        setNgos(data);
      } else {
        toast.error("Failed to fetch NGOs");
      }
    } catch (error) {
      console.error("Failed to fetch NGOs:", error);
      toast.error("Failed to fetch NGOs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ngo: NGO) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    if (!hasAdminRole) {
      alert("You don't have admin permissions");
      return;
    }

    if (!viewerRole) {
      alert("Unable to get VIEWER_ROLE. Please try again.");
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
          ngo.walletAddress as `0x${string}`,
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
      const res = await authenticatedFetch(`/api/ngos/${ngoId}/approve`, {
        method: "POST",
        body: JSON.stringify({
          walletAddress: selectedNGO?.walletAddress,
          txHash,
        }),
      });

      if (res.ok) {
        toast.success("NGO approved successfully");
        fetchNGOs();
        setShowModal(false);
        setSelectedNGO(null);
      } else {
        throw new Error("Failed to update backend");
      }
    } catch (error) {
      console.error("Failed to update backend:", error);
      alert("NGO approved on-chain but failed to update backend. Please update manually.");
    }
  };

  const handleReject = async (ngo: NGO) => {
    if (!confirm(`Are you sure you want to reject ${ngo.organizationName}?`)) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/ngos/${ngo.id}/reject`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("NGO rejected");
        fetchNGOs();
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">NGO Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve pending NGO applications
        </p>
      </div>

      {!isConnected && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please connect your wallet to approve NGOs
          </p>
        </div>
      )}

      {isConnected && !hasAdminRole && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Your wallet does not have admin permissions
          </p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ngos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No pending NGOs
                </td>
              </tr>
            ) : (
              ngos.map((ngo) => (
                <tr key={ngo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ngo.organizationName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ngo.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">
                      {formatAddress(ngo.walletAddress as `0x${string}`)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ngo.countryOfOperation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      <ClockIcon className="h-3 w-3" />
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedNGO(ngo);
                          setShowModal(true);
                        }}
                        className="text-[#0350B5] hover:text-[#034093]"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(ngo)}
                        disabled={!isConnected || !hasAdminRole || approvingId === ngo.id || isWriting || isConfirming}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvingId === ngo.id && (isWriting || isConfirming) ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(ngo)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NGO Details Modal */}
      {showModal && selectedNGO && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold mb-4">{selectedNGO.organizationName}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{selectedNGO.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {formatAddress(selectedNGO.walletAddress as `0x${string}`)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-sm text-gray-900">{selectedNGO.countryOfOperation}</p>
                </div>
                {/* Add more fields as needed */}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

