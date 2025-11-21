import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // TODO: Validate credentials with backend
    // TODO: Verify password hash
    // TODO: Generate JWT token

    // Mock response for now
    const mockToken = `mock-token-${Date.now()}`;

    return NextResponse.json({
      token: mockToken,
      user: {
        email,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Failed to sign in. Please try again." },
      { status: 500 }
    );
  }
}

