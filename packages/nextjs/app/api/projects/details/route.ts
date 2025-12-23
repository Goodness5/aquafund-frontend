import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, encodeFunctionData, decodeAbiParameters, getAbiItem, PublicClient } from "viem";
import { bscTestnet } from "viem/chains";
import externalContracts from "~~/contracts/externalContracts";
import AquaFundRegistryAbi from "~~/contracts/abis/AquaFundRegistry.json";
import AquaFundFactoryAbi from "~~/contracts/abis/AquaFundFactory.json";
import AquaFundProjectAbi from "~~/contracts/abis/AquaFundProject.json";
import { bytes32ToString } from "~~/utils/bytes32";
import scaffoldConfig from "~~/scaffold.config";

// Helper function to fetch project details from a project contract
async function fetchProjectDetails(
  publicClient: PublicClient,
  projectAddress: string,
  projectId: string | bigint
): Promise<{ info: any } | null> {
  try {
    const projectIdStr = projectId.toString();
    
    // Get project details from Project contract using getProjectInfo()
    const callData = encodeFunctionData({
      abi: AquaFundProjectAbi,
      functionName: "getProjectInfo",
      args: [],
    });

    const callResult = await publicClient.call({
      to: projectAddress as `0x${string}`,
      data: callData,
    });

    if (!callResult.data) {
      console.warn(`⚠️ [API] No data returned for project ${projectIdStr}`);
      return null;
    }

    // Decode the response
    const abiItem = getAbiItem({
      abi: AquaFundProjectAbi,
      name: "getProjectInfo",
    });

    if (!abiItem || abiItem.type !== "function") {
      throw new Error("Could not find getProjectInfo function in ABI");
    }

    const decoded = decodeAbiParameters(
      abiItem.outputs || [],
      callResult.data
    );

    const projectInfo = decoded[0] as any;

    // Handle both tuple (array) and object formats
    let info = projectInfo;
    if (Array.isArray(projectInfo)) {
      info = {
        projectId: projectInfo[0],
        admin: projectInfo[1],
        creator: projectInfo[2],
        fundingGoal: projectInfo[3],
        fundsRaised: projectInfo[4],
        status: projectInfo[5],
        title: projectInfo[6],
        description: projectInfo[7],
        images: projectInfo[8],
        location: projectInfo[9],
        category: projectInfo[10],
        createdAt: projectInfo[11],
        updatedAt: projectInfo[12],
      };
    }

    // Fetch donors and donation count
    let donors: any[] = [];
    let donationCount: bigint = BigInt(0);
    try {
      const [donorsResult, donationCountResult] = await Promise.all([
        publicClient.readContract({
          address: projectAddress as `0x${string}`,
          abi: AquaFundProjectAbi,
          functionName: "getDonors",
          args: [],
        }).catch(() => []),
        publicClient.readContract({
          address: projectAddress as `0x${string}`,
          abi: AquaFundProjectAbi,
          functionName: "getDonationCount",
          args: [],
        }).catch(() => BigInt(0)),
      ]);
      donors = Array.isArray(donorsResult) ? donorsResult : [];
      donationCount = typeof donationCountResult === "bigint" ? donationCountResult : BigInt(0);
    } catch (err) {
      console.warn(`⚠️ [API] Could not fetch donors/donation count for project ${projectIdStr}:`, err);
    }

    // Helper to safely convert strings
    const safeStringConvert = (value: any): string => {
      if (!value) return "N/A";
      if (typeof value === "string" && !value.startsWith("0x")) {
        return value;
      }
      if (typeof value === "string" && value.startsWith("0x") && value.length === 66) {
        return bytes32ToString(value);
      }
      return String(value);
    };

    // Convert fields
    const title = safeStringConvert(info.title);
    const description = safeStringConvert(info.description);
    const location = safeStringConvert(info.location);
    const category = safeStringConvert(info.category);
    
    // Images
    let imagePublicIds: string[] = [];
    if (Array.isArray(info.images)) {
      imagePublicIds = info.images.map((img: any) => safeStringConvert(img))
        .filter((img: string) => img && img !== "N/A");
    }
    
    // Reconstruct Cloudinary URLs
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqn6hax4c";
    const images = imagePublicIds.map((publicId: string) => {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
    });
    
    const donorCount = Array.isArray(donors) ? donors.length : 0;
    const totalDonations = Number(donationCount || BigInt(0));

    return {
      info: {
        projectId: (info.projectId || projectId).toString(),
        admin: info.admin,
        creator: info.creator || info.admin,
        fundingGoal: (info.fundingGoal || BigInt(0)).toString(),
        fundsRaised: (info.fundsRaised || BigInt(0)).toString(),
        status: Number(info.status || 0),
        title,
        description,
        images,
        location,
        category,
        createdAt: (info.createdAt || BigInt(0)).toString(),
        updatedAt: (info.updatedAt || BigInt(0)).toString(),
        donorCount,
        donationCount: totalDonations,
        projectAddress,
      },
    };
  } catch (error) {
    console.error(`❌ [API] Failed to fetch project details for ${projectId}:`, error);
    return null;
  }
}

// Get a single project by ID
async function getSingleProject(projectId: string, projectAddress?: string | null) {
  try {
        // Use RPC override if configured, otherwise use environment variable, otherwise fallback to default
        const rpcOverrides = scaffoldConfig.rpcOverrides as Record<number, string> | undefined;
        const rpcUrl = 
          (rpcOverrides && rpcOverrides[bscTestnet.id]) ||
          process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
          undefined;
        
        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: rpcUrl ? http(rpcUrl) : http(),
        });

    const factoryAddress = externalContracts[97]?.AquaFundFactory?.address;
    if (!factoryAddress) {
      return NextResponse.json(
        { error: "Factory contract address not configured" },
        { status: 500 }
      );
    }

    let projectAddr: string | null = projectAddress || null;

    // Get project address from Factory if not provided
    if (!projectAddr || !projectAddr.startsWith("0x") || projectAddr.length !== 42) {
      const fetchedAddress = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: AquaFundFactoryAbi,
        functionName: "getProjectAddress",
        args: [BigInt(projectId)],
      });

      projectAddr = fetchedAddress as string;

      if (!projectAddr || projectAddr === "0x0000000000000000000000000000000000000000") {
        return NextResponse.json(
          { error: `Project ${projectId} address not found` },
          { status: 404 }
        );
      }
    }

    // Get project details
    const projectData = await fetchProjectDetails(publicClient, projectAddr, projectId);
    
    if (!projectData) {
      return NextResponse.json(
        { error: `Project ${projectId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(projectData);
  } catch (error) {
    console.error("❌ [API] Error fetching single project:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get all projects
async function getAllProjects() {
  try {
        // Use RPC override if configured, otherwise use environment variable, otherwise fallback to default
        const rpcOverrides = scaffoldConfig.rpcOverrides as Record<number, string> | undefined;
        const rpcUrl = 
          (rpcOverrides && rpcOverrides[bscTestnet.id]) ||
          process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
          undefined;
        
        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: rpcUrl ? http(rpcUrl) : http(),
        });

    const registryAddress = externalContracts[97]?.AquaFundRegistry?.address;
    if (!registryAddress) {
      return NextResponse.json(
        { error: "Registry contract address not configured" },
        { status: 500 }
      );
    }

    const factoryAddress = externalContracts[97]?.AquaFundFactory?.address;
    if (!factoryAddress) {
      return NextResponse.json(
        { error: "Factory contract address not configured" },
        { status: 500 }
      );
    }

    // Step 1: Get all project IDs from Registry
    const allProjectIds = await publicClient.readContract({
      address: registryAddress as `0x${string}`,
      abi: AquaFundRegistryAbi,
      functionName: "getAllProjectIds",
      args: [],
    });

    if (!Array.isArray(allProjectIds) || allProjectIds.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    // Step 2 & 3: For each project ID, get address from Factory, then get details
    const projects = await Promise.all(
      (allProjectIds as bigint[]).slice(0, 50).map(async (projectId) => {
        try {
          const projectIdStr = projectId.toString();

          // Step 2: Get project address from Factory
          const projectAddress = await publicClient.readContract({
            address: factoryAddress as `0x${string}`,
            abi: AquaFundFactoryAbi,
            functionName: "getProjectAddress",
            args: [projectId],
          }) as string;

          if (!projectAddress || projectAddress === "0x0000000000000000000000000000000000000000") {
            return null;
          }

          // Step 3: Get project details
          return await fetchProjectDetails(publicClient, projectAddress, projectId);
        } catch (error) {
          console.error(`❌ [API] Failed to process project:`, error);
          return null;
        }
      })
    );

    const validProjects = projects.filter((p) => p !== null);

    return NextResponse.json({ projects: validProjects });
  } catch (error) {
    console.error("❌ [API] Error fetching projects:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch projects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const projectAddress = searchParams.get("projectAddress");

  // If projectId is provided, return single project; otherwise return all projects
  if (projectId) {
    return await getSingleProject(projectId, projectAddress);
  } else {
    return await getAllProjects();
  }
}
