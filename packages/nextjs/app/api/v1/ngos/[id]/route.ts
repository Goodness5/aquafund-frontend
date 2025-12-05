import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }
  return backendUrl;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = getBackendUrl();
    const { id } = await params;

    // Get authorization header if present
    const authHeader = req.headers.get("authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(`${backendUrl}/ngos/${id}`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.message || "Failed to fetch NGO" },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // Handle different response formats
    if (data && data.success && data.data) {
      return NextResponse.json({ success: true, data: data.data }, { status: 200 });
    }
    
    if (data && data.data && !data.success) {
      return NextResponse.json({ success: true, data: data.data }, { status: 200 });
    }
    
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching NGO:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch NGO";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

