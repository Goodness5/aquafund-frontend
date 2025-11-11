import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL not set" }, { status: 500 });
  }

  const res = await fetch(`${backendUrl}/users/${params.id}`);
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
