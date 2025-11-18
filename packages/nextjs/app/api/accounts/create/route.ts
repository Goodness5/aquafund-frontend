import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, email } = body;

    // Validate input
    if (!walletAddress && !email) {
      return NextResponse.json(
        { error: "Either wallet address or email is required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual backend API call
    // const backendUrl = process.env.BACKEND_API_URL;
    // if (!backendUrl) {
    //   return NextResponse.json({ error: "Backend URL not set" }, { status: 500 });
    // }
    //
    // const res = await fetch(`${backendUrl}/accounts/create`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ walletAddress, email }),
    // });
    //
    // if (!res.ok) {
    //   const error = await res.json();
    //   return NextResponse.json({ error: error.message || "Failed to create account" }, { status: res.status });
    // }
    //
    // const data = await res.json();
    // return NextResponse.json({ token: data.token, user: data.user }, { status: 200 });

    // Mock implementation - replace with actual backend call
    const mockToken = `auth-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const mockUser = {
      id: Math.random().toString(36).substring(7),
      walletAddress: walletAddress || null,
      email: email || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        token: mockToken,
        user: mockUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to create account:", error);
    const message = error instanceof Error ? error.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

