"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ProjectCard } from "../../_components/ProjectCard";

interface Fundraiser {
  id: number;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donations: number;
}

export default function FundraisersPage() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all project IDs from registry
  const { data: allProjectIds, isLoading: isLoadingIds, error: projectIdsError } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getAllProjectIds",
    chainId: targetNetwork.id,
  } as any);

  // Fetch and filter projects by creator address
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (isLoadingIds || !address) {
        return;
      }

      if (projectIdsError) {
        console.error("Error fetching project IDs:", projectIdsError);
        setLoading(false);
        return;
      }

      if (!allProjectIds || !Array.isArray(allProjectIds) || allProjectIds.length === 0) {
        setFundraisers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch project details for each project ID using API route
        const projectPromises = (allProjectIds as bigint[]).map(async (projectId) => {
          try {
            const response = await fetch(`/api/projects/details?projectId=${projectId.toString()}`, {
              method: "GET",
            });

            if (response.ok) {
              const data = await response.json();
              return {
                projectId: Number(projectId),
                details: data,
              };
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch project ${projectId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(projectPromises);
        const validResults = results.filter((r) => r !== null);

        // Filter projects where admin matches user's address
        const userProjects = validResults
          .filter((result) => {
            const admin = result?.details?.info?.admin || result?.details?.admin;
            return admin && admin.toLowerCase() === address.toLowerCase();
          })
          .map((result) => {
            const info = result?.details?.info || result?.details;
            return {
              id: result!.projectId,
              title: `Project #${result!.projectId}`,
              description: `Blockchain Project ID: ${result!.projectId}`,
              image: "/Home.png",
              raised: Number(formatEther(info?.fundsRaised || BigInt(0))),
              goal: Number(formatEther(info?.fundingGoal || BigInt(0))),
              donations: 0, // Can be fetched separately if needed
            };
          });

        setFundraisers(userProjects);
      } catch (error) {
        console.error("Failed to fetch user projects:", error);
        setFundraisers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [allProjectIds, isLoadingIds, projectIdsError, address]);

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2">Fundraisers</h1>
          <p className="text-sm lg:text-base text-[#475068]">Manage your fundraising campaigns</p>
        </div>
        <Link href="/dashboard/fundraisers/create">
          <Button
            size="lg"
            rounded="full"
            className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm lg:text-base shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Fundraiser
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[#475068] text-lg">Loading your fundraisers...</p>
        </div>
      ) : fundraisers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[#475068] text-lg mb-4">You haven't created any fundraisers yet.</p>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundraisers.map((fundraiser) => (
            <Link key={fundraiser.id} href={`/projects/${fundraiser.id}`} className="group block">
              <ProjectCard variant="light" project={fundraiser} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

