import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }
  return backendUrl;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = getBackendUrl();
    const { id } = await params;
    const body = await req.json();
    const { walletAddress, txHash } = body;

    // Forward auth token from request
    const authHeader = req.headers.get("authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Update NGO status in backend
    const res = await fetch(`${backendUrl}/ngos/${id}/approve`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        walletAddress,
        txHash,
        approved: true,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to approve NGO" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve NGO";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

