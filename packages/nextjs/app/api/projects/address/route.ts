import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import externalContracts from "~~/contracts/externalContracts";
import AquaFundFactoryAbi from "~~/contracts/abis/AquaFundFactory.json";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");

    console.log("🔍 [API] Getting project address - Request:", {
      projectId,
      url: req.url,
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

    // Get project address from Factory
    const factoryAddress = externalContracts[97]?.AquaFundFactory?.address as `0x${string}`;
    
    console.log("📋 [API] Factory Configuration:", {
      factoryAddress,
      chainId: 97,
      chainName: "BSC Testnet",
    });
    
    if (!factoryAddress) {
      console.error("❌ [API] Factory address not configured");
      return NextResponse.json({ error: "Factory address not configured" }, { status: 500 });
    }

    try {
      console.log("📞 [API] Calling Factory contract - getProjectAddress:", {
        contractAddress: factoryAddress,
        functionName: "getProjectAddress",
        args: [BigInt(projectId)],
        projectId: projectId,
      });

      const projectAddress = await publicClient.readContract({
        address: factoryAddress,
        abi: AquaFundFactoryAbi,
        functionName: "getProjectAddress",
        args: [BigInt(projectId)],
      });

      console.log("✅ [API] Factory call successful:", {
        projectId,
        projectAddress,
      });

      if (!projectAddress || projectAddress === "0x0000000000000000000000000000000000000000") {
        console.warn("⚠️ [API] Project address is invalid:", {
          projectId,
          projectAddress,
        });
        return NextResponse.json(
          { error: `Project ${projectId} address not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        address: projectAddress,
      });
    } catch (contractError: any) {
      console.error(`❌ [API] Factory contract read error for project ${projectId}:`, {
        error: contractError,
        message: contractError.message,
        stack: contractError.stack,
        name: contractError.name,
        shortMessage: contractError.shortMessage,
      });
      
      // Check if it's a revert (project doesn't exist)
      if (contractError.message?.includes("revert") || 
          contractError.message?.includes("execution reverted") ||
          contractError.shortMessage?.includes("revert")) {
        console.warn(`⚠️ [API] Project ${projectId} does not exist (contract reverted)`);
        return NextResponse.json(
          { error: `Project ${projectId} does not exist` },
          { status: 404 }
        );
      }
      throw contractError;
    }
  } catch (error) {
    console.error("❌ [API] Error getting project address:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message = error instanceof Error ? error.message : "Failed to get project address";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

