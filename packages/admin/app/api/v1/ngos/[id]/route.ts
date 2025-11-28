import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }
  return backendUrl;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const backendUrl = getBackendUrl();
    const { id } = await params;
    const body = await req.json();

    console.log("Updating NGO with ID:", id);
    console.log("Update data:", JSON.stringify(body, null, 2));

    // Get authorization header from request
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);

    // Backend URL already includes /api/v1, so just use /ngos/{id}
    const endpoint = `${backendUrl}/ngos/${id}`;
    console.log("Calling backend endpoint:", endpoint);
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const res = await fetch(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", res.status, res.statusText);

    if (!res.ok) {
      // Read response body once - try as text first, then parse if JSON
      const responseText = await res.text();
      let errorMessage = "Failed to update NGO";
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error("Backend error:", errorData);
      } catch {
        // If not JSON, use the text directly
        console.error("Backend error (non-JSON):", responseText.substring(0, 200));
        errorMessage = responseText.substring(0, 200) || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("Backend update response:", JSON.stringify(data, null, 2));
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating NGO:", error);
    const message = error instanceof Error ? error.message : "Failed to update NGO";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

