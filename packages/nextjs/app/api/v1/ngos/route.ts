import { NextRequest, NextResponse } from "next/server";

function getBackendUrl() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }
  return backendUrl;
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== NGO Creation API Route ===");
    const backendUrl = getBackendUrl();
    console.log("Backend URL:", backendUrl);
    
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Get authorization header if present
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendEndpoint = `${backendUrl}/api/v1/ngos`;
    console.log("Calling backend endpoint:", backendEndpoint);
    console.log("Request headers:", JSON.stringify(headers, null, 2));

    const res = await fetch(backendEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", res.status);
    console.log("Backend response status text:", res.statusText);

    // Get response as text first to handle non-JSON responses (like HTML error pages)
    const responseText = await res.text();
    console.log("Backend response text (first 500 chars):", responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Backend response data:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("Failed to parse backend response as JSON:", parseError);
      console.error("Full response text:", responseText);
      
      // If it's a 413 error, provide a helpful message
      if (res.status === 413) {
        return NextResponse.json(
          { 
            error: "Payload too large. Please reduce the size of uploaded images or files.",
            details: "The request body exceeds the maximum allowed size. Try compressing images or reducing file sizes."
          },
          { status: 413 }
        );
      }
      
      // For other errors, return the HTML/text response info
      return NextResponse.json(
        { 
          error: "Backend returned non-JSON response",
          status: res.status,
          statusText: res.statusText,
          responsePreview: responseText.substring(0, 200)
        },
        { status: res.status }
      );
    }

    if (!res.ok) {
      console.error("Backend returned error:", {
        status: res.status,
        statusText: res.statusText,
        data,
      });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error in NGO creation route:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    const message = error instanceof Error ? error.message : "Failed to create NGO";
    const status = message === "Backend URL not set" ? 500 : 502;
    console.error("Returning error response:", { message, status });
    return NextResponse.json({ error: message }, { status });
  }
}

