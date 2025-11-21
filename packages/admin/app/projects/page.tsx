"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import toast from "react-hot-toast";
import {
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import externalContracts from "../../contracts/externalContracts";
import AquaFundRegistryAbi from "../../contracts/abis/AquaFundRegistry.json";
import AquaFundFactoryAbi from "../../contracts/abis/AquaFundFactory.json";

const formatAddress = (address: `0x${string}`) => {
  if (!isAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface Project {
  projectId: bigint;
  address: `0x${string}`;
  admin: `0x${string}`;
  fundingGoal: bigint;
  fundsRaised: bigint;
  status: number;
  metadataUri: string;
}

export default function ProjectsPage() {
  const { address, isConnected } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [registerProjectId, setRegisterProjectId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { writeContract: writeRegistry, data: registerHash, isPending: isRegistering } = useWriteContract();
  const { isLoading: isConfirmingRegister, isSuccess: isRegisterConfirmed } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  // Get all project IDs
  const { data: allProjectIds, refetch: refetchProjectIds } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "getAllProjectIds",
  });

  // Get admin role
  const { data: adminRole } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

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
    if (isRegisterConfirmed) {
      toast.success("Project registered successfully");
      refetchProjectIds();
      setRegisterProjectId("");
    }
  }, [isRegisterConfirmed, refetchProjectIds]);

  useEffect(() => {
    fetchProjects();
  }, [allProjectIds]);

  const fetchProjects = async () => {
    if (!allProjectIds || !Array.isArray(allProjectIds)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const projectPromises = (allProjectIds as bigint[]).slice(0, 50).map(async (projectId) => {
        try {
          // Get project details from registry
          const response = await fetch("/api/projects/onchain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: projectId.toString() }),
          });
          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error(`Failed to fetch project ${projectId}:`, error);
        }
        return null;
      });

      const results = await Promise.all(projectPromises);
      setProjects(results.filter((p) => p !== null));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProject = () => {
    if (!registerProjectId || !hasAdminRole) {
      toast.error("Please enter a valid project ID and ensure you have admin permissions");
      return;
    }

    try {
      const projectId = BigInt(registerProjectId);
      writeRegistry({
        address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
        abi: AquaFundRegistryAbi,
        functionName: "registerProject",
        args: [projectId],
      });
    } catch (error) {
      console.error("Failed to register project:", error);
      toast.error("Invalid project ID");
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.projectId.toString().includes(query) ||
      project.address.toLowerCase().includes(query) ||
      project.admin.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and monitor all platform projects</p>
        </div>
        {hasAdminRole && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Register Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by project ID, address, or admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5]"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raised
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
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No projects found
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.projectId.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.projectId.toString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{formatAddress(project.address)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{formatAddress(project.admin)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Number(project.fundingGoal) / 1e18} ETH
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Number(project.fundsRaised) / 1e18} ETH
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {project.status === 0 ? "Active" : project.status === 1 ? "Completed" : "Cancelled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowModal(true);
                      }}
                      className="text-[#0350B5] hover:text-[#034093]"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {selectedProject ? "Project Details" : "Register New Project"}
              </h2>

              {selectedProject ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project ID</label>
                    <p className="text-sm text-gray-900">{selectedProject.projectId.toString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedProject.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admin</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedProject.admin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Funding Goal</label>
                    <p className="text-sm text-gray-900">{Number(selectedProject.fundingGoal) / 1e18} ETH</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Funds Raised</label>
                    <p className="text-sm text-gray-900">{Number(selectedProject.fundsRaised) / 1e18} ETH</p>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedProject(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={registerProjectId}
                      onChange={(e) => setRegisterProjectId(e.target.value)}
                      placeholder="Enter project ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5]"
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegisterProject}
                      disabled={!registerProjectId || isRegistering || isConfirmingRegister}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#0350B5] rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRegistering || isConfirmingRegister ? "Registering..." : "Register"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

