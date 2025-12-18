import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import externalContracts from "~~/contracts/externalContracts";
import AquaFundRegistryAbi from "~~/contracts/abis/AquaFundRegistry.json";
import AquaFundProjectAbi from "~~/contracts/abis/AquaFundProject.json";
// Removed bytes32 conversions - ABIs now use strings directly

export async function GET(req: NextRequest) {
  console.log("🚀 [API] Route handler called");
  
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const projectAddress = searchParams.get("projectAddress");

    console.log("🔍 [API] Fetching project details - Request:", {
      projectId,
      projectAddress,
      url: req.url,
      searchParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString(),
    });

    if (!projectId) {
      console.error("❌ [API] Project ID is required");
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Create a public client to read from the blockchain
    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });

    // Get Registry contract address
    const registryAddress = externalContracts[97]?.AquaFundRegistry?.address;
    if (!registryAddress) {
      console.error("❌ [API] Registry contract address not found");
      return NextResponse.json(
        { error: "Registry contract address not configured" },
        { status: 500 }
      );
    }

    console.log("📋 [API] Using Registry to fetch project details:", {
      registryAddress,
      projectId,
      chainId: 97,
      chainName: "BSC Testnet",
    });

    try {
      console.log("📞 [API] Calling Registry contract - getProjectDetails:", {
        contractAddress: registryAddress,
        functionName: "getProjectDetails",
        functionSignature: "getProjectDetails(uint256) returns (ProjectInfo)",
        args: [BigInt(projectId)],
        projectId: projectId,
      });

      // Fetch project details from Registry
      const projectInfo = await publicClient.readContract({
        address: registryAddress as `0x${string}`,
        abi: AquaFundRegistryAbi,
        functionName: "getProjectDetails",
        args: [BigInt(projectId)],
      });

      console.log("✅ [API] Registry call successful - Raw response:", {
        projectInfo,
        type: typeof projectInfo,
        isArray: Array.isArray(projectInfo),
        keys: projectInfo ? Object.keys(projectInfo) : null,
        fullStructure: JSON.stringify(projectInfo, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        ),
      });

      // getProjectDetails returns ProjectInfo struct - viem decodes it as an object
      let info = projectInfo as any;
      
      // Handle both tuple (array) and object formats
      if (Array.isArray(projectInfo)) {
        // If it's an array, it's a tuple - convert to object based on ProjectInfo struct
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

      // Get project address from parameter to fetch donors and donation count
      let donors: any[] = [];
      let donationCount: bigint = BigInt(0);

      if (projectAddress && projectAddress.startsWith("0x") && projectAddress.length === 42) {
        try {
          const [donorsResult, donationCountResult] = await Promise.all([
            publicClient.readContract({
              address: projectAddress as `0x${string}`,
              abi: AquaFundProjectAbi,
              functionName: "getDonors",
              args: [],
            }).catch(() => []) as Promise<any[]>,
            publicClient.readContract({
              address: projectAddress as `0x${string}`,
              abi: AquaFundProjectAbi,
              functionName: "getDonationCount",
              args: [],
            }).catch(() => BigInt(0)) as Promise<bigint>,
          ]);
          donors = Array.isArray(donorsResult) ? donorsResult : [];
          donationCount = typeof donationCountResult === "bigint" ? donationCountResult : BigInt(0);
        } catch (err) {
          console.warn("⚠️ [API] Could not fetch donors/donation count:", err);
        }
      }
        
        console.log("📦 [API] Extracted info object:", {
          info,
          isArray: Array.isArray(projectInfo),
          infoKeys: info ? Object.keys(info) : null,
          admin: info?.admin,
          creator: info?.creator,
          fundingGoal: info?.fundingGoal?.toString(),
          fundsRaised: info?.fundsRaised?.toString(),
          status: info?.status,
          projectId: info?.projectId?.toString(),
          title: info?.title,
          description: info?.description,
          images: info?.images,
          location: info?.location,
          category: info?.category,
          createdAt: info?.createdAt?.toString(),
          updatedAt: info?.updatedAt?.toString(),
        });
        
      if (!info) {
        console.warn("⚠️ [API] Project info is null/undefined:", {
          projectId,
          projectAddress,
          rawResponse: projectInfo,
        });
        return NextResponse.json(
          { error: `Project ${projectId} info is null` },
          { status: 404 }
        );
      }
      
      if (!info.admin || info.admin === "0x0000000000000000000000000000000000000000") {
        console.warn("⚠️ [API] Project info has invalid admin:", {
          projectId,
          projectAddress,
          admin: info?.admin,
          hasInfo: !!info,
        });
        return NextResponse.json(
          { error: `Project ${projectId} has invalid admin address` },
          { status: 404 }
        );
      }
        
        // Registry now returns strings directly (no bytes32 conversion needed)
        const title = info.title || "";
        const description = info.description || "";
        const location = info.location || "";
        const category = info.category || "";
        
        // Images are now string[] directly
        const imagePublicIds = Array.isArray(info.images) ? info.images : [];
        
        // Reconstruct Cloudinary URLs from publicIds
        // publicId format stored: "fund/axn1o67h2bz9zieh9cop" (full publicId with folder)
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{publicId}
        // Note: Cloudinary URLs work without file extension, the publicId is enough
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqn6hax4c";
        const images = imagePublicIds.map((publicId) => {
          // publicId already includes folder (e.g., "fund/axn1o67h2bz9zieh9cop")
          // Cloudinary will serve the image with the correct format based on the upload
          return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
        });
        
        // Get donor count and donation count
        const donorCount = Array.isArray(donors) ? donors.length : 0;
        const totalDonations = Number(donationCount || BigInt(0));
        
        // Convert BigInt values to strings for JSON serialization
        const response = {
          info: {
            projectId: (info.projectId || BigInt(projectId || "0")).toString(),
            admin: info.admin,
            creator: info.creator || info.admin, // Fallback to admin if creator not available
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
          },
        };

        console.log("✅ [API] Sending response:", {
          ...response,
        });
        
        return NextResponse.json(response);
      } catch (contractError: any) {
        console.error(`❌ [API] Project contract read error for project ${projectId}:`, {
          error: contractError,
          message: contractError.message,
          stack: contractError.stack,
          name: contractError.name,
          cause: contractError.cause,
          shortMessage: contractError.shortMessage,
          details: contractError.details,
        });
        
        // Check if it's a revert (contract doesn't exist or not initialized)
        if (contractError.message?.includes("revert") || 
            contractError.message?.includes("execution reverted") ||
            contractError.shortMessage?.includes("revert")) {
          console.warn(`⚠️ [API] Project contract reverted for ${projectId}:`, {
            projectAddress,
          error: contractError.message || contractError.shortMessage,
        });
        return NextResponse.json(
          { error: `Project contract at ${projectAddress} reverted or doesn't exist` },
          { status: 404 }
        );
      }
      
      throw contractError;
    }
  } catch (error) {
    console.error("❌ [API] Error fetching project from contract:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message = error instanceof Error ? error.message : "Failed to fetch project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

