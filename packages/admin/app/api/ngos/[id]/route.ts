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

    console.log("Fetching NGO with ID:", id);
    console.log("Backend URL:", backendUrl);
    const endpoint = `${backendUrl}/ngos/${id}`;
    console.log("Calling endpoint:", endpoint);

    const res = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", res.status, res.statusText);

    if (!res.ok) {
      // Try to get error message from response
      let errorMessage = "Failed to fetch NGO";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error("Backend error:", errorData);
      } catch {
        const text = await res.text();
        console.error("Backend error (non-JSON):", text.substring(0, 200));
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // Log the response for debugging
    console.log("Backend NGO response:", JSON.stringify(data, null, 2));
    
    // Handle different response formats
    // Backend might return the NGO directly or wrapped in { success: true, data: {...} }
    if (data && data.success && data.data) {
      return NextResponse.json(data.data, { status: 200 });
    }
    
    if (data && data.data && !data.success) {
      // Some backends wrap in { data: {...} } without success field
      return NextResponse.json(data.data, { status: 200 });
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching NGO:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch NGO";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

