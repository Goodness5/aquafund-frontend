import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }
  return backendUrl;
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    
    // Forward auth token from request if present
    const authHeader = req.headers.get("authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const res = await fetch(`${backendUrl}/ngos`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch NGOs" },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return NextResponse.json(data, { status: 200 });
    } else if (data && Array.isArray(data.data)) {
      // Handle case where response is wrapped in { data: [...] }
      return NextResponse.json(data.data, { status: 200 });
    } else {
      // If response is not an array, return empty array
      console.error("Backend returned non-array response:", data);
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch NGOs";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

