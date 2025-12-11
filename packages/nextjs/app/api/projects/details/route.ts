import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import externalContracts from "~~/contracts/externalContracts";
import AquaFundRegistryAbi from "~~/contracts/abis/AquaFundRegistry.json";
import AquaFundProjectAbi from "~~/contracts/abis/AquaFundProject.json";

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

    // projectAddress is required - fetch full details from Project contract
    if (!projectAddress) {
      console.error("❌ [API] Project address is required to fetch full project details");
      return NextResponse.json(
        { error: "Project address is required. Use /api/projects/address?projectId=X to get the address first." },
        { status: 400 }
      );
    }
    console.log("📋 [API] Using Project contract to fetch full details:", {
      projectAddress,
      projectId,
      chainId: 97,
      chainName: "BSC Testnet",
    });

    // Verify contract address is valid
    if (!projectAddress || !projectAddress.startsWith("0x") || projectAddress.length !== 42) {
      console.error("❌ [API] Invalid project address:", projectAddress);
      return NextResponse.json(
        { error: `Invalid project address: ${projectAddress}` },
        { status: 400 }
      );
    }

    try {
      console.log("📞 [API] Calling Project contract - getProjectInfo:", {
        contractAddress: projectAddress,
        functionName: "getProjectInfo",
        functionSignature: "getProjectInfo() returns (ProjectInfo)",
        args: [],
        projectId: projectId,
        abiLength: AquaFundProjectAbi.length,
      });

      const projectInfo = await publicClient.readContract({
        address: projectAddress as `0x${string}`,
        abi: AquaFundProjectAbi,
        functionName: "getProjectInfo",
        args: [],
      });

        console.log("✅ [API] Project contract call successful - Raw response:", {
          projectInfo,
          type: typeof projectInfo,
          isArray: Array.isArray(projectInfo),
          keys: projectInfo ? Object.keys(projectInfo) : null,
          fullStructure: JSON.stringify(projectInfo, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          ),
        });

        // getProjectInfo returns ProjectInfo struct directly as a tuple
        // viem decodes it as an object with the struct fields
        let info = projectInfo as any;
        
        // Handle both tuple (array) and object formats
        if (Array.isArray(projectInfo)) {
          // If it's an array, it's a tuple - convert to object
          info = {
            projectId: projectInfo[0],
            admin: projectInfo[1],
            fundingGoal: projectInfo[2],
            fundsRaised: projectInfo[3],
            status: projectInfo[4],
            metadataUri: projectInfo[5],
          };
        }
        
        console.log("📦 [API] Extracted info object:", {
          info,
          isArray: Array.isArray(projectInfo),
          infoKeys: info ? Object.keys(info) : null,
          admin: info?.admin,
          fundingGoal: info?.fundingGoal?.toString(),
          fundsRaised: info?.fundsRaised?.toString(),
          status: info?.status,
          projectId: info?.projectId?.toString(),
          metadataUri: info?.metadataUri,
          rawProjectInfo: projectInfo,
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
        
        // Convert BigInt values to strings for JSON serialization
        const response = {
          info: {
            projectId: (info.projectId || BigInt(projectId || "0")).toString(),
            admin: info.admin,
            fundingGoal: (info.fundingGoal || BigInt(0)).toString(),
            fundsRaised: (info.fundsRaised || BigInt(0)).toString(),
            status: Number(info.status || 0),
            metadataUri: info.metadataUri || "",
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

