"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import FundraiserCard, { FundraiserCardData } from "../../_components/dashboard/FundraiserCard";
import externalContracts from "~~/contracts/externalContracts";

type FilterType = "all" | "active" | "completed" | "paused";

export default function FundraisersPage() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [fundraisers, setFundraisers] = useState<FundraiserCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Get all project IDs from Registry
  const { data: allProjectIds, isLoading: isLoadingIds, error: projectIdsError } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getAllProjectIds",
    chainId: targetNetwork.id,
  } as any);

  // Fetch and filter projects by admin address from Registry
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (isLoadingIds) {
        console.log("⏳ [Frontend] Still loading project IDs from Registry...");
        return;
      }

      if (!address) {
        console.log("⚠️ [Frontend] No wallet address connected");
        setLoading(false);
        return;
      }

      if (projectIdsError) {
        console.error("❌ [Frontend] Error fetching project IDs from Registry:", {
          error: projectIdsError,
          message: projectIdsError?.message,
          stack: projectIdsError?.stack,
        });
        setLoading(false);
        return;
      }

      if (!allProjectIds || !Array.isArray(allProjectIds)) {
        console.log("📋 [Frontend] No project IDs found or invalid format:", {
          allProjectIds,
          type: typeof allProjectIds,
          isArray: Array.isArray(allProjectIds),
        });
        setFundraisers([]);
        setLoading(false);
        return;
      }

      if (allProjectIds.length === 0) {
        console.log("📭 [Frontend] No projects found in Registry:", {
          userAddress: address,
        });
        setFundraisers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`🚀 [Frontend] Starting fetch process from Registry:`, {
          totalProjects: allProjectIds.length,
          projectIds: (allProjectIds as bigint[]).map(id => Number(id)),
          userAddress: address,
          timestamp: new Date().toISOString(),
        });
        
        // Step 1: Get project addresses from Factory for each project ID
        console.log("📋 [Frontend] Step 1: Getting project addresses from Factory...");
        const factoryAddress = externalContracts[97]?.AquaFundFactory?.address;
        if (!factoryAddress) {
          throw new Error("Factory address not configured");
        }

        // Get project addresses from Factory
        const addressPromises = (allProjectIds as bigint[]).map(async (projectId) => {
          try {
            const response = await fetch(`/api/projects/address?projectId=${projectId.toString()}`, {
              method: "GET",
            });
            if (response.ok) {
              const data = await response.json();
              return {
                projectId: Number(projectId),
                projectAddress: data.address,
              };
            }
            return null;
          } catch (error) {
            console.error(`Failed to get address for project ${projectId}:`, error);
            return null;
          }
        });

        const projectAddresses = await Promise.all(addressPromises);
        const validAddresses = projectAddresses.filter((p): p is { projectId: number; projectAddress: string } => 
          p !== null && p !== undefined && p.projectAddress !== undefined && p.projectAddress !== null
        );
        
        console.log(`✅ [Frontend] Got ${validAddresses.length} project addresses from Factory`);

        // Step 2: Fetch full project details from each Project contract
        const projectPromises = validAddresses.map(async ({ projectId, projectAddress }) => {
          console.log(`🔍 [Frontend] Fetching project ${projectId} from Project contract:`, {
            projectId,
            projectAddress,
            timestamp: new Date().toISOString(),
          });

          try {
            // Fetch full project details from Project contract
            const response = await fetch(`/api/projects/details?projectId=${projectId.toString()}&projectAddress=${projectAddress}`, {
              method: "GET",
            });

            console.log(`📡 [Frontend] Response for project ${projectId}:`, {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
              headers: Object.fromEntries(response.headers.entries()),
            });

            if (response.ok) {
              const data = await response.json();
              
              console.log(`✅ [Frontend] Successfully fetched project ${projectId}:`, {
                projectId,
                data,
                dataKeys: Object.keys(data),
                info: data.info,
                infoKeys: data.info ? Object.keys(data.info) : null,
                admin: data.info?.admin,
                fundingGoal: data.info?.fundingGoal?.toString(),
                fundsRaised: data.info?.fundsRaised?.toString(),
              });

              return {
                projectId,
                projectAddress,
                details: data,
              };
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error(`❌ [Frontend] Failed to fetch project ${projectId}:`, {
                projectId,
                projectAddress,
                status: response.status,
                statusText: response.statusText,
                errorData,
              });
              return null;
            }
          } catch (error) {
            console.error(`❌ [Frontend] Error fetching project ${projectId}:`, {
              projectId,
              projectAddress,
              error,
              message: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            });
            return null;
          }
        });

        const results = await Promise.all(projectPromises);
        const validResults = results.filter((r) => r !== null);
        
        console.log(`📊 [Frontend] Fetch Summary:`, {
          totalProjectIds: allProjectIds.length,
          validAddresses: validAddresses.length,
          validResults: validResults.length,
          failedResults: allProjectIds.length - validResults.length,
          validResultsDetails: validResults.map(r => ({
            projectId: r?.projectId,
            projectAddress: r?.projectAddress,
            hasDetails: !!r?.details,
            hasInfo: !!r?.details?.info,
            admin: r?.details?.info?.admin || r?.details?.admin,
          })),
        });

        // Filter projects by admin or creator address matching the user
        const userProjects = validResults
          .filter((result) => {
            const info = result?.details?.info || result?.details;
            const admin = info?.admin;
            const creator = info?.creator;
            const matchesUser = 
              (admin && admin.toLowerCase() === address?.toLowerCase()) ||
              (creator && creator.toLowerCase() === address?.toLowerCase());
            
            console.log(`🔍 [Frontend] Filtering project ${result?.projectId}:`, {
              projectId: result?.projectId,
              admin,
              creator,
              userAddress: address,
              matchesUser,
            });
            
            return matchesUser;
          })
          .map((result) => {
            const admin = result?.details?.info?.admin || result?.details?.admin;
            const creator = result?.details?.info?.creator || result?.details?.creator;
            
            console.log(`✅ [Frontend] Processing project ${result?.projectId}:`, {
              projectId: result?.projectId,
              admin,
              creator,
              adminMatchesUser: admin?.toLowerCase() === address?.toLowerCase(),
              creatorMatchesUser: creator?.toLowerCase() === address?.toLowerCase(),
            });
            const info = result?.details?.info || result?.details;
            // Handle both string (from API) and BigInt formats
            const fundsRaised = typeof info?.fundsRaised === 'string' 
              ? BigInt(info.fundsRaised) 
              : (info?.fundsRaised || BigInt(0));
            const fundingGoal = typeof info?.fundingGoal === 'string'
              ? BigInt(info.fundingGoal)
              : (info?.fundingGoal || BigInt(0));
            const raised = Number(formatEther(fundsRaised));
            const goal = Number(formatEther(fundingGoal));
            
            console.log(`📝 [Frontend] Processing project ${result!.projectId}:`, {
              projectId: result!.projectId,
              info,
              raised,
              goal,
              fundsRaisedRaw: info?.fundsRaised?.toString(),
              fundingGoalRaw: info?.fundingGoal?.toString(),
            });
            
            // Determine status based on project state
            // Status: 0 = Active, 1 = Completed, 2 = Paused, 3 = Cancelled
            const contractStatus = Number(info?.status || 0);
            let status: "active" | "completed" | "paused" = "active";
            if (contractStatus === 1 || (raised >= goal && goal > 0)) {
              status = "completed";
            } else if (contractStatus === 2) {
              status = "paused";
            }
            
            // Get metadata from API response
            const title = info?.title || "N/A";
            const location = info?.location || "N/A";
            const category = info?.category || "N/A";
            const images = info?.images || [];
            const firstImage = images.length > 0 ? images[0] : "N/A";
            const donorCount = info?.donorCount || 0;
            const donationCount = info?.donationCount || 0;
            
            // Calculate days left from createdAt (if available)
            let daysLeft = 0;
            if (info?.createdAt) {
              const createdAt = Number(info.createdAt);
              if (createdAt > 0) {
                // Assuming 90 days campaign duration (can be adjusted)
                const campaignDuration = 90 * 24 * 60 * 60; // 90 days in seconds
                const endTime = createdAt + campaignDuration;
                const now = Math.floor(Date.now() / 1000);
                daysLeft = Math.max(0, Math.ceil((endTime - now) / (24 * 60 * 60)));
              }
            }
            
            const fundraiserData = {
              id: result!.projectId,
              title: title !== "N/A" ? title : `Project #${result!.projectId}`,
              location: location !== "N/A" ? location : "N/A",
              category: category !== "N/A" ? category : "N/A",
              status,
              raised,
              goal,
              donors: donorCount,
              daysLeft: daysLeft > 0 ? daysLeft : 0,
              recentDonations: donationCount,
              views: 0, // Not available from contract, show 0
              image: firstImage !== "N/A" ? firstImage : "/Home.png",
            } as FundraiserCardData;

            console.log(`✅ [Frontend] Created fundraiser data for project ${result!.projectId}:`, fundraiserData);
            
            return fundraiserData;
          });

        console.log(`🎯 [Frontend] Final Results:`, {
          totalProjects: allProjectIds.length,
          validProjects: validResults.length,
          userProjects: userProjects.length,
          userAddress: address,
          userProjectsList: userProjects.map(p => ({
            id: p.id,
            title: p.title,
            raised: p.raised,
            goal: p.goal,
            status: p.status,
            admin: validResults.find(r => r?.projectId === p.id)?.details?.info?.admin,
          })),
        });
        
        setFundraisers(userProjects);
      } catch (error) {
        console.error("❌ [Frontend] Failed to fetch user projects:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        setFundraisers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [allProjectIds, isLoadingIds, projectIdsError, address, refreshKey]);

  // Filter and search fundraisers
  const filteredFundraisers = useMemo(() => {
    return fundraisers.filter((fundraiser) => {
      // Filter by status
      const matchesFilter =
        activeFilter === "all" || fundraiser.status === activeFilter;

      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        fundraiser.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fundraiser.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fundraiser.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [fundraisers, activeFilter, searchQuery]);

  const handleEdit = (id: number) => {
    // Navigate to edit page
    window.location.href = `/dashboard/fundraisers/${id}/edit`;
  };

  const handleShare = (id: number, title: string) => {
    // Share functionality - use redirect URL, it will handle slug
    const url = `${window.location.origin}/projects/${id}`;
    if (navigator.share) {
      navigator.share({
        title: `Check out this fundraiser`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      // You could show a toast notification here
    }
  };

  const handleTogglePause = (id: number) => {
    // Toggle pause functionality
    setFundraisers((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: f.status === "paused" ? "active" : "paused" }
          : f
      )
    );
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Paused", value: "paused" },
  ];

  return (
    <div className="w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#001627] mb-2">Fundraisers</h1>
          <p className="text-base text-[#475068]">See details about your fundraisers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshKey(prev => prev + 1);
              setLoading(true);
            }}
            disabled={loading}
            className="p-2 text-[#475068] hover:text-[#0350B5] hover:bg-[#E1FFFF] rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh fundraisers"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/dashboard/fundraisers/create">
            <Button
              size="lg"
              rounded="full"
              className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300 font-medium text-sm lg:text-base shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Fundraiser
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter.value
                ? "bg-[#0350B5] text-white"
                : "bg-white text-[#475068] hover:bg-[#F5F5F5] border border-[#CAC4D0]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#475068]" />
        <input
          type="text"
          placeholder="Search fundraisers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#CAC4D0] rounded-lg text-[#001627] placeholder-[#475068] focus:outline-none focus:ring-2 focus:ring-[#0350B5] focus:border-transparent"
        />
      </div>

      {/* Fundraisers Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[#475068] text-lg">Loading your fundraisers...</p>
        </div>
      ) : filteredFundraisers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[#475068] text-lg mb-2">
            {searchQuery || activeFilter !== "all"
              ? "No fundraisers match your filters."
              : "You haven't created any fundraisers yet."}
          </p>
          {!searchQuery && activeFilter === "all" && (
            <>
              <p className="text-sm text-[#475068] mb-4">
                If you just created a fundraiser, wait a few seconds for the transaction to confirm, then click the refresh button.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setRefreshKey(prev => prev + 1);
                    setLoading(true);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-[#E1FFFF] text-[#0350B5] rounded-lg hover:bg-[#CFFED9] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <Link href="/dashboard/fundraisers/create">
                  <Button
                    size="lg"
                    rounded="full"
                    className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300"
                  >
                    Create Your First Fundraiser
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFundraisers.map((fundraiser) => (
            <FundraiserCard
              key={fundraiser.id}
              fundraiser={fundraiser}
              onEdit={handleEdit}
              onShare={handleShare}
              onTogglePause={handleTogglePause}
            />
          ))}
        </div>
      )}
    </div>
  );
}

