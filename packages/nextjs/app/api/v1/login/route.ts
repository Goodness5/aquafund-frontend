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
    const backendUrl = getBackendUrl();
    const body = await req.json();

    // Validate required fields
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password (should not be empty)
    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const backendEndpoint = `${backendUrl}/login`;
    const res = await fetch(backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Check if response is JSON before parsing
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      // If backend returns non-JSON (like HTML error page), return a proper error
      await res.text(); // Consume the response body
      
      // Provide more helpful error message
      let errorMessage = `Backend endpoint not found (404)`;
      if (res.status === 404) {
        errorMessage = `Backend endpoint not found. Please verify that the endpoint exists at: ${backendEndpoint}`;
      } else {
        errorMessage = `Backend returned non-JSON response: ${res.status} ${res.statusText}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: res.status === 404 ? "The backend API endpoint does not exist or the backend URL is incorrect." : undefined
        },
        { status: res.status || 502 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to login";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

