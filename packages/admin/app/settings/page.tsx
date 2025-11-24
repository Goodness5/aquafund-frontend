"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import toast from "react-hot-toast";
import {
  KeyIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  PauseIcon,
  PlayIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import externalContracts from "../../contracts/externalContracts";
import AquaFundRegistryAbi from "../../contracts/abis/AquaFundRegistry.json";
import AquaFundFactoryAbi from "../../contracts/abis/AquaFundFactory.json";
import AquaFundBadgeAbi from "../../contracts/abis/AquaFundBadge.json";
import AquaFundProjectAbi from "../../contracts/abis/AquaFundProject.json";

const formatAddress = (address: `0x${string}`) => {
  if (!isAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"overview" | "factory" | "registry" | "badge" | "projects">("overview");
  
  // Role management
  const [roleAddress, setRoleAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "defaultAdmin" | "viewer" | "projectCreator">("admin");
  
  // Factory settings
  const [newTreasury, setNewTreasury] = useState("");
  const [newServiceFee, setNewServiceFee] = useState("");
  const [newBadgeContract, setNewBadgeContract] = useState("");
  const [newRegistry, setNewRegistry] = useState("");
  
  // Token management
  const [tokenAddress, setTokenAddress] = useState("");
  
  // Badge settings
  const [newBaseURI, setNewBaseURI] = useState("");
  const [badgeMinterAddress, setBadgeMinterAddress] = useState("");
  
  // Project settings
  const [selectedProjectAddress, setSelectedProjectAddress] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState<"0" | "1" | "2">("0");

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get role constants - Factory is the main role controller
  const { data: factoryAdminRole } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: factoryAdminRoleAlt } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "ADMIN_ROLE",
  });

  const { data: viewerRole } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "VIEWER_ROLE",
  });

  const { data: projectCreatorRole } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "PROJECT_CREATOR_ROLE",
  });

  // Check admin permissions - Factory is the main role controller
  const { data: hasAdminRole } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "hasRole",
    args: [
      (factoryAdminRole as `0x${string}`) || (factoryAdminRoleAlt as `0x${string}`) || "0x0000000000000000000000000000000000000000000000000000000000000000",
      address || "0x",
    ],
    query: {
      enabled: !!address && !!(factoryAdminRole || factoryAdminRoleAlt),
    },
  });

  // Factory settings
  const { data: implementationAddress } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "IMPLEMENTATION",
  });

  const { data: currentTreasury } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getTreasury",
  });

  const { data: currentServiceFee } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getServiceFee",
  });

  const { data: isPaused } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "paused",
  });

  const { data: allowAllTokensValue } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "allowAllTokens",
  });

  // Get current badge contract and registry addresses
  const { data: currentBadgeContract } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "badgeContract",
  });

  const { data: currentRegistry } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "registry",
  });

  // Get allowed tokens list
  const { data: allowedTokens, refetch: refetchAllowedTokens } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getAllowedTokens",
    query: {
      enabled: !allowAllTokensValue,
    },
  });

  // Badge contract settings
  const { data: badgeBaseURI } = useReadContract({
    address: externalContracts[97]?.AquaFundBadge?.address as `0x${string}`,
    abi: AquaFundBadgeAbi,
    functionName: "baseURI",
  });

  const { data: badgeMinterRole } = useReadContract({
    address: externalContracts[97]?.AquaFundBadge?.address as `0x${string}`,
    abi: AquaFundBadgeAbi,
    functionName: "MINTER_ROLE",
  });

  // Get project info if address is selected
  const { data: projectInfo, refetch: refetchProjectInfo } = useReadContract({
    address: selectedProjectAddress as `0x${string}`,
    abi: AquaFundProjectAbi,
    functionName: "getProjectInfo",
    query: {
      enabled: !!selectedProjectAddress && isAddress(selectedProjectAddress),
    },
  });

  // Get all project IDs for selection
  const { data: allProjectIds, refetch: refetchProjectIds } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "getAllProjectIds",
  });

  // Get platform stats from Factory
  const { data: factoryStats } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getPlatformStats",
  });

  // Get platform stats from Registry
  const { data: registryStats } = useReadContract({
    address: externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`,
    abi: AquaFundRegistryAbi,
    functionName: "getPlatformStats",
  });

  // Get total projects from Factory
  const { data: totalProjectsFactory } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getTotalProjects",
  });

  // Get total donors from Factory
  const { data: totalDonors } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "getTotalDonors",
  });

  // Get total funds raised from Factory
  const { data: totalFundsRaised } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "totalFundsRaised",
  });

  // State for projects list
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const handleGrantRole = () => {
    if (!roleAddress || !isAddress(roleAddress)) {
      toast.error("Please enter a valid address");
      return;
    }

    let role: `0x${string}`;
    let contractAddress: `0x${string}`;
    let abi: any;
    let functionName: string;

    if (selectedRole === "admin") {
      // Factory ADMIN_ROLE
      contractAddress = externalContracts[97]?.AquaFundFactory?.address as `0x${string}`;
      abi = AquaFundFactoryAbi;
      functionName = "grantRole";
      role = factoryAdminRoleAlt as `0x${string}`;
    } else if (selectedRole === "defaultAdmin") {
      // Factory DEFAULT_ADMIN_ROLE
      contractAddress = externalContracts[97]?.AquaFundFactory?.address as `0x${string}`;
      abi = AquaFundFactoryAbi;
      functionName = "grantRole";
      role = factoryAdminRole as `0x${string}`;
    } else if (selectedRole === "projectCreator") {
      contractAddress = externalContracts[97]?.AquaFundFactory?.address as `0x${string}`;
      abi = AquaFundFactoryAbi;
      functionName = "grantProjectCreatorRole";
      writeContract({
        address: contractAddress,
        abi,
        functionName,
        args: [roleAddress as `0x${string}`],
      });
      return;
    } else {
      // Viewer role is managed on Registry
      contractAddress = externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`;
      abi = AquaFundRegistryAbi;
      functionName = "grantRole";
      role = viewerRole as `0x${string}`;
    }

    if (!role) {
      toast.error("Role not loaded");
      return;
    }

    writeContract({
      address: contractAddress,
      abi,
      functionName,
      args: [role, roleAddress as `0x${string}`],
    });
  };

  const handleUpdateTreasury = () => {
    if (!newTreasury || !isAddress(newTreasury)) {
      toast.error("Please enter a valid treasury address");
      return;
    }

    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "updateTreasury",
      args: [newTreasury as `0x${string}`],
    });
  };

  const handleUpdateServiceFee = () => {
    if (!newServiceFee) {
      toast.error("Please enter a valid service fee");
      return;
    }

    const fee = BigInt(newServiceFee);
    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "updateServiceFee",
      args: [fee],
    });
  };

  const handleSetBadgeContract = () => {
    if (!newBadgeContract || !isAddress(newBadgeContract)) {
      toast.error("Please enter a valid badge contract address");
      return;
    }

    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "setBadgeContract",
      args: [newBadgeContract as `0x${string}`],
    });
  };

  const handleSetRegistry = () => {
    if (!newRegistry || !isAddress(newRegistry)) {
      toast.error("Please enter a valid registry address");
      return;
    }

    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "setRegistry",
      args: [newRegistry as `0x${string}`],
    });
  };

  const handleToggleAllowAllTokens = () => {
    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "setAllowAllTokens",
      args: [!allowAllTokensValue],
    });
  };

  const handleAddToken = () => {
    if (!tokenAddress || !isAddress(tokenAddress)) {
      toast.error("Please enter a valid token address");
      return;
    }

    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "addAllowedToken",
      args: [tokenAddress as `0x${string}`],
    });
  };

  const handleRemoveToken = (token: string) => {
    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "removeAllowedToken",
      args: [token as `0x${string}`],
    });
  };

  const handleSetBadgeBaseURI = () => {
    if (!newBaseURI) {
      toast.error("Please enter a valid base URI");
      return;
    }

    writeContract({
      address: externalContracts[97]?.AquaFundBadge?.address as `0x${string}`,
      abi: AquaFundBadgeAbi,
      functionName: "setBaseURI",
      args: [newBaseURI],
    });
  };

  const handleGrantBadgeMinterRole = () => {
    if (!badgeMinterAddress || !isAddress(badgeMinterAddress)) {
      toast.error("Please enter a valid address");
      return;
    }

    if (!badgeMinterRole) {
      toast.error("Minter role not loaded");
      return;
    }

    writeContract({
      address: externalContracts[97]?.AquaFundBadge?.address as `0x${string}`,
      abi: AquaFundBadgeAbi,
      functionName: "grantRole",
      args: [badgeMinterRole as `0x${string}`, badgeMinterAddress as `0x${string}`],
    });
  };

  const handlePause = () => {
    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "pause",
    });
  };

  const handleUnpause = () => {
    writeContract({
      address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "unpause",
    });
  };

  const handleUpdateProjectStatus = () => {
    if (!selectedProjectAddress || !isAddress(selectedProjectAddress)) {
      toast.error("Please select a valid project address");
      return;
    }

    writeContract({
      address: selectedProjectAddress as `0x${string}`,
      abi: AquaFundProjectAbi,
      functionName: "updateStatus",
      args: [BigInt(newProjectStatus)],
    });
  };

  const handleReleaseFunds = () => {
    if (!selectedProjectAddress || !isAddress(selectedProjectAddress)) {
      toast.error("Please select a valid project address");
      return;
    }

    writeContract({
      address: selectedProjectAddress as `0x${string}`,
      abi: AquaFundProjectAbi,
      functionName: "releaseFunds",
    });
  };

  const handleRefundAllDonors = () => {
    if (!selectedProjectAddress || !isAddress(selectedProjectAddress)) {
      toast.error("Please select a valid project address");
      return;
    }

    if (!confirm("Are you sure you want to refund all donors? This action cannot be undone.")) {
      return;
    }

    writeContract({
      address: selectedProjectAddress as `0x${string}`,
      abi: AquaFundProjectAbi,
      functionName: "refundAllDonors",
    });
  };

  // Fetch all projects
  useEffect(() => {
    const fetchAllProjects = async () => {
      if (!allProjectIds || !Array.isArray(allProjectIds)) {
        return;
      }

      try {
        setLoadingProjects(true);
        const projectPromises = (allProjectIds as bigint[]).map(async (projectId) => {
          try {
            const projectDetails = await fetch("/api/projects/onchain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: projectId.toString() }),
            });
            if (projectDetails.ok) {
              const data = await projectDetails.json();
              return { ...data, projectId: projectId.toString() };
            }
          } catch (error) {
            console.error(`Failed to fetch project ${projectId}:`, error);
          }
          return null;
        });

        const results = await Promise.all(projectPromises);
        setProjectsList(results.filter((p) => p !== null));
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchAllProjects();
  }, [allProjectIds]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed");
      setRoleAddress("");
      setNewTreasury("");
      setNewServiceFee("");
      setNewBadgeContract("");
      setNewRegistry("");
      setTokenAddress("");
      setNewBaseURI("");
      setBadgeMinterAddress("");
      refetchAllowedTokens();
      if (selectedProjectAddress) {
        refetchProjectInfo();
      }
      refetchProjectIds();
    }
  }, [isConfirmed, refetchAllowedTokens, selectedProjectAddress, refetchProjectInfo, refetchProjectIds]);

  if (!isConnected || !hasAdminRole) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          {!isConnected
            ? "Please connect your wallet"
            : "Your wallet does not have admin permissions"}
        </p>
      </div>
    );
  }

  const projectInfoData = projectInfo as any;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-[#001627]">Manage contracts, roles, and individual project instances</p>
      </div>

      {/* Contract Overview */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-[#0350B5] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Contract Architecture</h3>
            <div className="text-sm text-[#001627] space-y-1">
              <p><strong className="text-gray-900">Factory:</strong> Creates new project instances (clones) from the implementation contract</p>
              <p><strong className="text-gray-900">Implementation:</strong> Template contract that each project is cloned from</p>
              <p><strong className="text-gray-900">Registry:</strong> Central registry for project discovery and analytics</p>
              <p><strong className="text-gray-900">Badge:</strong> ERC721 NFT contract for donor badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`${
              activeTab === "overview"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-[#001627] hover:text-[#0350B5] hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <InformationCircleIcon className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("factory")}
            className={`${
              activeTab === "factory"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-[#001627] hover:text-[#0350B5] hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Factory (Global)
          </button>
          <button
            onClick={() => setActiveTab("registry")}
            className={`${
              activeTab === "registry"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-[#001627] hover:text-[#0350B5] hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <KeyIcon className="w-5 h-5" />
            Registry (Roles)
          </button>
          <button
            onClick={() => setActiveTab("badge")}
            className={`${
              activeTab === "badge"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-[#001627] hover:text-[#0350B5] hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Badge (NFT)
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`${
              activeTab === "projects"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-[#001627] hover:text-[#0350B5] hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <BuildingOfficeIcon className="w-5 h-5" />
            Projects (Instances)
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factory Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5 text-[#0350B5]" />
                Factory Contract
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#001627]">Address:</span>
                  <span className="font-mono text-gray-900">
                    {formatAddress(externalContracts[97]?.AquaFundFactory?.address as `0x${string}`)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#001627]">Implementation:</span>
                  <span className="font-mono text-gray-900">
                    {implementationAddress ? formatAddress(implementationAddress as `0x${string}`) : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#001627]">Treasury:</span>
                  <span className="font-mono text-gray-900">
                    {currentTreasury ? formatAddress(currentTreasury as `0x${string}`) : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#001627]">Service Fee:</span>
                  <span className="text-gray-900">
                    {currentServiceFee ? `${Number(currentServiceFee)} bps` : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#001627]">Status:</span>
                  <span className={isPaused ? "text-red-600" : "text-green-600"}>
                    {isPaused ? "Paused" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Registry Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <KeyIcon className="w-5 h-5 text-[#0350B5]" />
                Registry Contract
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#001627]">Address:</span>
                  <span className="font-mono text-gray-900">
                    {formatAddress(externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#001627]">Badge Contract:</span>
                  <span className="font-mono text-gray-900">
                    {currentBadgeContract ? formatAddress(currentBadgeContract as `0x${string}`) : "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Badge Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5 text-[#0350B5]" />
                Badge Contract
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#001627]">Address:</span>
                  <span className="font-mono text-gray-900">
                    {formatAddress(externalContracts[97]?.AquaFundBadge?.address as `0x${string}`)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#001627]">Base URI:</span>
                  <span className="text-gray-900 font-mono text-xs break-all">
                    {badgeBaseURI ? (badgeBaseURI as string).slice(0, 30) + "..." : "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Implementation Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-[#0350B5]" />
                Implementation Contract
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#001627]">Address:</span>
                  <span className="font-mono text-gray-900">
                    {formatAddress(externalContracts[97]?.AquaFundProject?.address as `0x${string}`)}
                  </span>
                </div>
                <p className="text-xs text-[#001627] mt-3">
                  This is the template contract. Each project is a clone (proxy) of this implementation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Factory Settings Tab */}
      {activeTab === "factory" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
            <p className="text-sm text-[#001627]">
              <strong className="text-gray-900">Factory Settings:</strong> These settings affect all projects globally. Changes here apply to all existing and future projects.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Treasury & Fees</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Treasury Address</label>
                <div className="mb-2">
                  <span className="text-xs text-[#001627]">Current: </span>
                  <span className="text-xs font-mono text-[#001627]">
                    {currentTreasury ? formatAddress(currentTreasury as `0x${string}`) : "Loading..."}
                  </span>
                </div>
                <input
                  type="text"
                  value={newTreasury}
                  onChange={(e) => setNewTreasury(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                />
                <button
                  onClick={handleUpdateTreasury}
                  disabled={!newTreasury || isWriting || isConfirming}
                  className="mt-2 w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWriting || isConfirming ? "Updating..." : "Update Treasury"}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Service Fee (basis points)</label>
                <div className="mb-2">
                  <span className="text-xs text-[#001627]">Current: </span>
                  <span className="text-xs text-[#001627]">
                    {currentServiceFee ? `${Number(currentServiceFee)} bps (${Number(currentServiceFee) / 100}%)` : "Loading..."}
                  </span>
                </div>
                <input
                  type="number"
                  value={newServiceFee}
                  onChange={(e) => setNewServiceFee(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] text-[#001627] bg-white placeholder:text-gray-400"
                />
                <button
                  onClick={handleUpdateServiceFee}
                  disabled={!newServiceFee || isWriting || isConfirming}
                  className="mt-2 w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWriting || isConfirming ? "Updating..." : "Update Service Fee"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract References</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Badge Contract Address</label>
                <div className="mb-2">
                  <span className="text-xs text-[#001627]">Current: </span>
                  <span className="text-xs font-mono text-[#001627]">
                    {currentBadgeContract ? formatAddress(currentBadgeContract as `0x${string}`) : "Loading..."}
                  </span>
                </div>
                <input
                  type="text"
                  value={newBadgeContract}
                  onChange={(e) => setNewBadgeContract(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                />
                <button
                  onClick={handleSetBadgeContract}
                  disabled={!newBadgeContract || isWriting || isConfirming}
                  className="mt-2 w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWriting || isConfirming ? "Updating..." : "Update Badge Contract"}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Registry Address</label>
                <div className="mb-2">
                  <span className="text-xs text-[#001627]">Current: </span>
                  <span className="text-xs font-mono text-[#001627]">
                    {currentRegistry ? formatAddress(currentRegistry as `0x${string}`) : "Loading..."}
                  </span>
                </div>
                <input
                  type="text"
                  value={newRegistry}
                  onChange={(e) => setNewRegistry(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                />
                <button
                  onClick={handleSetRegistry}
                  disabled={!newRegistry || isWriting || isConfirming}
                  className="mt-2 w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWriting || isConfirming ? "Updating..." : "Update Registry"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Token Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow All Tokens</p>
                  <p className="text-sm text-[#001627]">When enabled, any ERC20 token can be used for donations</p>
                </div>
                <button
                  onClick={handleToggleAllowAllTokens}
                  disabled={isWriting || isConfirming}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    allowAllTokensValue
                      ? "bg-[#0350B5] text-white hover:bg-[#034093]"
                      : "bg-gray-200 text-[#001627] hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  {allowAllTokensValue ? "Enabled" : "Disabled"}
                </button>
              </div>
              {!allowAllTokensValue && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#001627] mb-2">Add Allowed Token</label>
                    <input
                      type="text"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleAddToken}
                      disabled={!tokenAddress || isWriting || isConfirming}
                      className="mt-2 w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWriting || isConfirming ? "Adding..." : "Add Token"}
                    </button>
                  </div>
                  {allowedTokens && Array.isArray(allowedTokens) && allowedTokens.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-[#001627] mb-2">Allowed Tokens</label>
                      <div className="space-y-2">
                        {allowedTokens.map((token: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-mono text-gray-900">{formatAddress(token as `0x${string}`)}</span>
                            <button
                              onClick={() => handleRemoveToken(token)}
                              disabled={isWriting || isConfirming}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Controls</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Pause/Unpause Factory</p>
                <p className="text-sm text-[#001627]">Temporarily halt all factory operations (project creation, donations)</p>
              </div>
              {isPaused ? (
                <button
                  onClick={handleUnpause}
                  disabled={isWriting || isConfirming}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50"
                >
                  <PlayIcon className="w-5 h-5" />
                  Unpause
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  disabled={isWriting || isConfirming}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <PauseIcon className="w-5 h-5" />
                  Pause
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registry Settings Tab */}
      {activeTab === "registry" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
            <p className="text-sm text-[#001627]">
              <strong className="text-gray-900">Role Management:</strong> Factory is the main role controller. All admin roles (ADMIN_ROLE, DEFAULT_ADMIN_ROLE) and Project Creator roles are managed on Factory. Viewer roles (for viewing projects) are managed on Registry.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grant Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Role Type</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] text-[#001627] bg-white placeholder:text-gray-400"
                >
                  <option value="admin">Admin Role (Factory) - ADMIN_ROLE on Factory</option>
                  <option value="defaultAdmin">Default Admin Role (Factory) - DEFAULT_ADMIN_ROLE on Factory</option>
                  <option value="projectCreator">Project Creator Role (Factory) - Can create projects</option>
                  <option value="viewer">Viewer Role (Registry) - Can view projects</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Address</label>
                <input
                  type="text"
                  value={roleAddress}
                  onChange={(e) => setRoleAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleGrantRole}
                disabled={!roleAddress || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Processing..." : "Grant Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Settings Tab */}
      {activeTab === "badge" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
            <p className="text-sm text-[#001627]">
              <strong className="text-gray-900">Badge Settings:</strong> Manage the ERC721 NFT contract for donor badges. These settings affect badge metadata and minting permissions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Base URI</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Current Base URI</label>
                <p className="text-sm text-[#001627] font-mono break-all p-3 bg-gray-50 rounded-lg">
                  {badgeBaseURI ? (badgeBaseURI as string) : "Loading..."}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">New Base URI</label>
                <input
                  type="text"
                  value={newBaseURI}
                  onChange={(e) => setNewBaseURI(e.target.value)}
                  placeholder="https://example.com/metadata/"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] text-[#001627] bg-white placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleSetBadgeBaseURI}
                disabled={!newBaseURI || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Updating..." : "Update Base URI"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Minter Role Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Grant Minter Role</label>
                <p className="text-xs text-[#001627] mb-2">Addresses with minter role can mint badges for donors</p>
                <input
                  type="text"
                  value={badgeMinterAddress}
                  onChange={(e) => setBadgeMinterAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleGrantBadgeMinterRole}
                disabled={!badgeMinterAddress || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Granting..." : "Grant Minter Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Settings Tab */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
            <p className="text-sm text-[#001627]">
              <strong className="text-gray-900">Project Settings:</strong> Manage individual project instances. Each project is a clone of the implementation contract with its own state.
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-[#001627]">Total Projects (Factory)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalProjectsFactory ? totalProjectsFactory.toString() : "0"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-[#001627]">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalDonors ? totalDonors.toString() : "0"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-[#001627]">Total Funds Raised</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalFundsRaised ? `${(Number(totalFundsRaised) / 1e18).toFixed(2)} ETH` : "0 ETH"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-[#001627]">Registered Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {allProjectIds && Array.isArray(allProjectIds) ? allProjectIds.length : "0"}
              </p>
            </div>
          </div>

          {/* All Projects List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h2>
            {loadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0350B5]"></div>
              </div>
            ) : projectsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Project ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Goal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Raised</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#001627] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projectsList.map((project: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {project.projectId || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#001627] font-mono">
                          {project.address ? formatAddress(project.address as `0x${string}`) : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#001627] font-mono">
                          {project.admin ? formatAddress(project.admin as `0x${string}`) : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {project.fundingGoal ? `${(Number(project.fundingGoal) / 1e18).toFixed(2)} ETH` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {project.fundsRaised ? `${(Number(project.fundsRaised) / 1e18).toFixed(2)} ETH` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 0 
                              ? "bg-green-100 text-green-800" 
                              : project.status === 1 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {project.status === 0 ? "Active" : project.status === 1 ? "Completed" : "Cancelled"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setSelectedProjectAddress(project.address);
                            }}
                            className="text-[#0350B5] hover:text-[#034093] font-medium"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#001627] text-center py-8">No projects found</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#001627] mb-2">Project Contract Address</label>
                <input
                  type="text"
                  value={selectedProjectAddress}
                  onChange={(e) => setSelectedProjectAddress(e.target.value)}
                  placeholder="0x... (Enter project contract address)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono text-[#001627] bg-white placeholder:text-gray-400"
                />
                <p className="text-xs text-[#001627] mt-1">
                  Enter the contract address of a specific project instance to manage it
                </p>
              </div>
            </div>
          </div>

          {selectedProjectAddress && isAddress(selectedProjectAddress) && projectInfoData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#001627]">Project ID:</span>
                    <span className="text-gray-900 font-mono">{projectInfoData.projectId?.toString() || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#001627]">Admin:</span>
                    <span className="text-gray-900 font-mono">{formatAddress(projectInfoData.admin as `0x${string}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#001627]">Funding Goal:</span>
                    <span className="text-gray-900">
                      {projectInfoData.fundingGoal ? `${Number(projectInfoData.fundingGoal) / 1e18} ETH` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#001627]">Funds Raised:</span>
                    <span className="text-gray-900">
                      {projectInfoData.fundsRaised ? `${Number(projectInfoData.fundsRaised) / 1e18} ETH` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#001627]">Status:</span>
                    <span className="text-gray-900">
                      {projectInfoData.status === 0 ? "Active" : projectInfoData.status === 1 ? "Completed" : "Cancelled"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Project Status</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#001627] mb-2">New Status</label>
                    <select
                      value={newProjectStatus}
                      onChange={(e) => setNewProjectStatus(e.target.value as "0" | "1" | "2")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] text-[#001627] bg-white placeholder:text-gray-400"
                    >
                      <option value="0">Active</option>
                      <option value="1">Completed</option>
                      <option value="2">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={handleUpdateProjectStatus}
                    disabled={isWriting || isConfirming}
                    className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWriting || isConfirming ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fund Management</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow">
                    <p className="text-sm text-[#001627] mb-3">
                      <strong className="text-gray-900">Release Funds:</strong> Transfer all raised funds to the project admin
                    </p>
                    <button
                      onClick={handleReleaseFunds}
                      disabled={isWriting || isConfirming}
                      className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWriting || isConfirming ? "Processing..." : "Release Funds to Admin"}
                    </button>
                  </div>
                  <div className="p-4 bg-white border border-red-200 rounded-lg shadow">
                    <p className="text-sm text-[#001627] mb-3">
                      <strong className="text-gray-900">Refund All Donors:</strong> Return all donations to donors. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleRefundAllDonors}
                      disabled={isWriting || isConfirming}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWriting || isConfirming ? "Processing..." : "Refund All Donors"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
