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

    // Forward auth token from request - REQUIRED for this operation
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      console.error("Reject request missing authorization header");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": authHeader, // Always include since we validated it exists
    };

    const res = await fetch(`${backendUrl}/ngos/${id}/reject`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to reject NGO" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject NGO";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

