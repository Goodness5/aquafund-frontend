import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import externalContracts from "~~/contracts/externalContracts";
import AquaFundRegistryAbi from "~~/contracts/abis/AquaFundRegistry.json";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Create a public client to read from the blockchain
    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    });

    // Get project details from registry
    const registryAddress = externalContracts[97]?.AquaFundRegistry?.address as `0x${string}`;
    
    if (!registryAddress) {
      return NextResponse.json({ error: "Registry address not configured" }, { status: 500 });
    }

    const projectDetails = await publicClient.readContract({
      address: registryAddress,
      abi: AquaFundRegistryAbi,
      functionName: "getProjectDetails",
      args: [BigInt(projectId)],
    });

    // Extract project info from the response
    const info = (projectDetails as any).info || projectDetails;
    
    return NextResponse.json({
      info: {
        projectId: info.projectId || BigInt(projectId),
        admin: info.admin || "0x0000000000000000000000000000000000000000",
        fundingGoal: info.fundingGoal || BigInt(0),
        fundsRaised: info.fundsRaised || BigInt(0),
        status: info.status || 0,
        metadataUri: info.metadataUri || "",
      },
    });
  } catch (error) {
    console.error("Error fetching project from contract:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

