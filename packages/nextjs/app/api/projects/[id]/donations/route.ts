import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import externalContracts from "~~/contracts/externalContracts";
import AquaFundFactoryAbi from "~~/contracts/abis/AquaFundFactory.json";
import AquaFundProjectAbi from "~~/contracts/abis/AquaFundProject.json";
import { formatEther } from "viem";
import scaffoldConfig from "~~/scaffold.config";

// Cache donations for 30 seconds to reduce RPC load
const CACHE_DURATION = 30 * 1000; // 30 seconds
const donationCache = new Map<string, { data: any; timestamp: number }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = id;
    const searchParams = req.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Check cache first (unless force refresh)
    const cacheKey = `donations-${projectId}`;
    if (!forceRefresh) {
      const cached = donationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`✅ [API] Returning cached donations for project ${projectId}`);
        return NextResponse.json({ donations: cached.data });
      }
    } else {
      // Clear cache if force refresh
      donationCache.delete(cacheKey);
      console.log(`🔄 [API] Force refresh requested for project ${projectId}`);
    }

    // Create a public client to read from the blockchain
    // Use RPC override if configured, otherwise use environment variable, otherwise fallback to default
    const rpcOverrides = scaffoldConfig.rpcOverrides as Record<number, string> | undefined;
    const rpcUrl = 
      (rpcOverrides && rpcOverrides[bscTestnet.id]) ||
      process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
      undefined; // undefined will use default chain RPC
    
    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    // Get Factory contract address
    const factoryAddress = externalContracts[97]?.AquaFundFactory?.address;
    if (!factoryAddress) {
      return NextResponse.json(
        { error: "Factory contract address not configured" },
        { status: 500 }
      );
    }

    // Get project address from Factory
    const projectAddress = await publicClient.readContract({
      address: factoryAddress as `0x${string}`,
      abi: AquaFundFactoryAbi,
      functionName: "getProjectAddress",
      args: [BigInt(projectId)],
    });

    if (!projectAddress || projectAddress === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json(
        { error: `Project ${projectId} address not found` },
        { status: 404 }
      );
    }

    // Fetch donations using contract functions instead of events
    // This avoids RPC limits and is more reliable
    console.log(`📋 [API] Fetching donor data for project ${projectId} from contract ${projectAddress}`);

    try {
      // Get all donor addresses
      const donors = await publicClient.readContract({
        address: projectAddress as `0x${string}`,
        abi: AquaFundProjectAbi,
        functionName: "getDonors",
        args: [],
      });

      if (!Array.isArray(donors) || donors.length === 0) {
        console.log(`✅ [API] No donors found for project ${projectId}`);
        return NextResponse.json({ donations: [] });
      }

      console.log(`✅ [API] Found ${donors.length} donors for project ${projectId}`);

      // Get donation amount for each donor
      const donationPromises = (donors as `0x${string}`[]).map(async (donor) => {
        try {
          const totalDonation = await publicClient.readContract({
            address: projectAddress as `0x${string}`,
            abi: AquaFundProjectAbi,
            functionName: "getDonation",
            args: [donor],
          });

          return {
            donor: donor as string,
            amount: formatEther(totalDonation as bigint),
            currency: "BNB", // Contract stores total, can't distinguish BNB vs tokens
          };
        } catch (error) {
          console.error(`Error fetching donation for donor ${donor}:`, error);
          return null;
        }
      });

      const donationResults = await Promise.all(donationPromises);
      const donations = donationResults
        .filter((d): d is NonNullable<typeof d> => d !== null && Number(d.amount) > 0) // Filter out nulls and zero donations
        .sort((a, b) => Number(b.amount) - Number(a.amount)) // Sort by amount (highest first)
        .slice(0, 50); // Limit to 50 donors

      console.log(`✅ [API] Processed ${donations.length} donations for project ${projectId}`);

      // Cache the results
      donationCache.set(cacheKey, {
        data: donations,
        timestamp: Date.now(),
      });

      // Clean up old cache entries (older than 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      for (const [key, value] of donationCache.entries()) {
        if (value.timestamp < fiveMinutesAgo) {
          donationCache.delete(key);
        }
      }

      return NextResponse.json({ donations });
    } catch (error) {
      console.error("❌ [API] Error fetching donations from contract:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch donations";
      // Return empty array on error instead of failing
      return NextResponse.json({ donations: [] });
    }
  } catch (error) {
    console.error("❌ [API] Error fetching donations:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch donations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
