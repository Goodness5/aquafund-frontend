import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Check Content-Type to ensure it's form data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
      return NextResponse.json(
        { error: `Invalid Content-Type: ${contentType}. Expected multipart/form-data or application/x-www-form-urlencoded` },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      return NextResponse.json({ error: "Backend URL not set" }, { status: 500 });
    }

    // Get authorization header if present
    const authHeader = req.headers.get("authorization");
    const headers: HeadersInit = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Forward the FormData to the backend
    const res = await fetch(`${backendUrl}/accounts/update`, {
      method: "POST",
      headers,
      body: formData, // FormData can be sent directly
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Failed to update account:", error);
    const message = error instanceof Error ? error.message : "Failed to update account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

