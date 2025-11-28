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
    const {  email } = body;
    
    if ( !email ) {
      return NextResponse.json(
        { error: "Email is required" },
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


    const res = await fetch(`${backendUrl}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email}),
    });

    const data = await res.json();
    console.log(`This is the RESPNSE FROM THE BACKEND ON OTP SEND: ${JSON.stringify(data)}`);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    const status = message === "Backend URL not set" ? 500 : 502;
    console.log(`This is the ERROR FROM THE BACKEND ON OTP SEND: ${message}`);
    return NextResponse.json({ error: message }, { status });
  }
}

