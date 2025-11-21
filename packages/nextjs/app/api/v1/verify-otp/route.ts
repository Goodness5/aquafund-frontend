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
    const { email, otp } = body;
    
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Missing required fields: email and otp are required" },
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

    // Validate OTP format (should be a string of digits, typically 4-6 digits)
    const otpRegex = /^\d+$/;
    if (!otpRegex.test(otp)) {
      return NextResponse.json(
        { error: "Invalid OTP format. OTP should contain only digits" },
        { status: 400 }
      );
    }

    const res = await fetch(`${backendUrl}/api/v1/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
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
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

