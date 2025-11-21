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
} from "@heroicons/react/24/outline";
import externalContracts from "../../contracts/externalContracts";
import AquaFundRegistryAbi from "../../contracts/abis/AquaFundRegistry.json";
import AquaFundFactoryAbi from "../../contracts/abis/AquaFundFactory.json";

const formatAddress = (address: `0x${string}`) => {
  if (!isAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"roles" | "factory" | "tokens">("roles");
  
  // Role management
  const [roleAddress, setRoleAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "viewer" | "projectCreator">("viewer");
  
  // Factory settings
  const [newTreasury, setNewTreasury] = useState("");
  const [newServiceFee, setNewServiceFee] = useState("");
  const [newBadgeContract, setNewBadgeContract] = useState("");
  const [newRegistry, setNewRegistry] = useState("");
  const [allowAllTokens, setAllowAllTokens] = useState(false);
  
  // Token management
  const [tokenAddress, setTokenAddress] = useState("");

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get role constants
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

  const { data: projectCreatorRole } = useReadContract({
    address: externalContracts[97]?.AquaFundFactory?.address as `0x${string}`,
    abi: AquaFundFactoryAbi,
    functionName: "PROJECT_CREATOR_ROLE",
  });

  // Check admin permissions
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

  // Factory settings
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

  const handleGrantRole = () => {
    if (!roleAddress || !isAddress(roleAddress)) {
      toast.error("Please enter a valid address");
      return;
    }

    let role: `0x${string}`;
    let contractAddress: `0x${string}`;
    let abi: any;
    let functionName: string;

    if (selectedRole === "projectCreator") {
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
      contractAddress = externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`;
      abi = AquaFundRegistryAbi;
      functionName = "grantRole";
      role = selectedRole === "admin" 
        ? (adminRole as `0x${string}`)
        : (viewerRole as `0x${string}`);
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

  const handleRevokeRole = (addressToRevoke: string, roleType: "admin" | "viewer" | "projectCreator") => {
    let role: `0x${string}`;
    let contractAddress: `0x${string}`;
    let abi: any;
    let functionName: string;

    if (roleType === "projectCreator") {
      contractAddress = externalContracts[97]?.AquaFundFactory?.address as `0x${string}`;
      abi = AquaFundFactoryAbi;
      functionName = "revokeProjectCreatorRole";
      writeContract({
        address: contractAddress,
        abi,
        functionName,
        args: [addressToRevoke as `0x${string}`],
      });
      return;
    } else {
      contractAddress = externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`;
      abi = AquaFundRegistryAbi;
      functionName = "revokeRole";
      role = roleType === "admin"
        ? (adminRole as `0x${string}`)
        : (viewerRole as `0x${string}`);
    }

    if (!role) {
      toast.error("Role not loaded");
      return;
    }

    writeContract({
      address: contractAddress,
      abi,
      functionName,
      args: [role, addressToRevoke as `0x${string}`],
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

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed");
      setRoleAddress("");
      setNewTreasury("");
      setNewServiceFee("");
      setNewBadgeContract("");
      setNewRegistry("");
      setTokenAddress("");
    }
  }, [isConfirmed]);

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage platform configuration and permissions</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("roles")}
            className={`${
              activeTab === "roles"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <KeyIcon className="w-5 h-5" />
            Role Management
          </button>
          <button
            onClick={() => setActiveTab("factory")}
            className={`${
              activeTab === "factory"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Factory Settings
          </button>
          <button
            onClick={() => setActiveTab("tokens")}
            className={`${
              activeTab === "tokens"
                ? "border-[#0350B5] text-[#0350B5]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <PlusIcon className="w-5 h-5" />
            Token Management
          </button>
        </nav>
      </div>

      {/* Role Management Tab */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grant Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Type</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5]"
                >
                  <option value="viewer">Viewer Role</option>
                  <option value="admin">Admin Role</option>
                  <option value="projectCreator">Project Creator Role</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={roleAddress}
                  onChange={(e) => setRoleAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono"
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

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Settings</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Treasury Address:</span>
                <span className="font-mono text-gray-900">
                  {currentTreasury ? formatAddress(currentTreasury as `0x${string}`) : "Loading..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Fee:</span>
                <span className="text-gray-900">
                  {currentServiceFee ? `${Number(currentServiceFee)} basis points` : "Loading..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Paused:</span>
                <span className="text-gray-900">{isPaused ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Allow All Tokens:</span>
                <span className="text-gray-900">{allowAllTokensValue ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Factory Settings Tab */}
      {activeTab === "factory" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Treasury</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Treasury Address</label>
                <input
                  type="text"
                  value={newTreasury}
                  onChange={(e) => setNewTreasury(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono"
                />
              </div>
              <button
                onClick={handleUpdateTreasury}
                disabled={!newTreasury || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Updating..." : "Update Treasury"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Service Fee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Service Fee (basis points, e.g., 1000 = 10%)
                </label>
                <input
                  type="number"
                  value={newServiceFee}
                  onChange={(e) => setNewServiceFee(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5]"
                />
              </div>
              <button
                onClick={handleUpdateServiceFee}
                disabled={!newServiceFee || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Updating..." : "Update Service Fee"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Badge Contract</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Badge Contract Address</label>
                <input
                  type="text"
                  value={newBadgeContract}
                  onChange={(e) => setNewBadgeContract(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono"
                />
              </div>
              <button
                onClick={handleSetBadgeContract}
                disabled={!newBadgeContract || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Updating..." : "Update Badge Contract"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Registry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Registry Address</label>
                <input
                  type="text"
                  value={newRegistry}
                  onChange={(e) => setNewRegistry(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono"
                />
              </div>
              <button
                onClick={handleSetRegistry}
                disabled={!newRegistry || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Updating..." : "Update Registry"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Controls</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Allow All Tokens</p>
                  <p className="text-sm text-gray-500">Enable/disable allowing all tokens</p>
                </div>
                <button
                  onClick={handleToggleAllowAllTokens}
                  disabled={isWriting || isConfirming}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    allowAllTokensValue
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50`}
                >
                  {allowAllTokensValue ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Pause/Unpause Contract</p>
                  <p className="text-sm text-gray-500">Temporarily halt contract operations</p>
                </div>
                {isPaused ? (
                  <button
                    onClick={handleUnpause}
                    disabled={isWriting || isConfirming}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Unpause
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    disabled={isWriting || isConfirming}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    <PauseIcon className="w-5 h-5" />
                    Pause
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Management Tab */}
      {activeTab === "tokens" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Allowed Token</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Token Address</label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] font-mono"
                />
              </div>
              <button
                onClick={handleAddToken}
                disabled={!tokenAddress || isWriting || isConfirming}
                className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming ? "Adding..." : "Add Token"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Allowed Tokens</h2>
            <p className="text-sm text-gray-500 mb-4">
              {allowAllTokensValue
                ? "All tokens are currently allowed"
                : "Only specific tokens are allowed"}
            </p>
            {/* TODO: Fetch and display list of allowed tokens */}
            <p className="text-sm text-gray-400 italic">Token list feature coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}

