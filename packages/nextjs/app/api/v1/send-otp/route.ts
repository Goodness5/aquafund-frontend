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
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: "Missing required field: email is required" },
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

    const res = await fetch(`${backendUrl}/api/v1/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Check if response is JSON before parsing
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      // If backend returns non-JSON (like HTML error page), return a proper error
      await res.text(); // Consume the response body
      return NextResponse.json(
        { error: `Backend returned non-JSON response: ${res.status} ${res.statusText}` },
        { status: res.status || 502 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

