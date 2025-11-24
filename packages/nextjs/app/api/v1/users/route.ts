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

    // Support both old format (name, email, wallet, companyName, role) and new format (email, password)
    // Check if password is provided to determine which format
    if (body.password) {
      // New registration format: email and password
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

      // Validate password strength (minimum 6 characters)
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      const res = await fetch(`${backendUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      // Old format: name, email, wallet, companyName, role
      const { name, email, wallet, companyName, role } = body;
      
      if (!name || !email || !wallet || !companyName || !role) {
        return NextResponse.json(
          { error: "Missing required fields: name, email, wallet, companyName, and role are required" },
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

      // Validate wallet address format (basic Ethereum address validation)
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(wallet)) {
        return NextResponse.json(
          { error: "Invalid wallet address format" },
          { status: 400 }
        );
      }

      const res = await fetch(`${backendUrl}/api/v1/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, wallet, companyName, role }),
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

