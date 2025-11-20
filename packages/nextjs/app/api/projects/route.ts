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

    // Convert FormData to JSON object for backend
    // Only include Project model fields: title, description, images, fundingGoal, creatorId, locationId
    const requestData: Record<string, any> = {};
    const images: string[] = [];
    
    // Define allowed Project model fields (excluding auto-generated fields)
    const projectFields = ["title", "description", "creatorId", "fundingGoal", "locationId"];
    
    formData.forEach((value, key) => {
      if (key === "images") {
        // Collect all images into an array (filter out empty strings)
        const imageValue = value as string;
        if (imageValue && imageValue.trim() !== "") {
          images.push(imageValue);
        }
      } else if (projectFields.includes(key)) {
        // Only include allowed Project model fields
        if (key === "fundingGoal") {
          // Convert fundingGoal to number (must be positive)
          const goal = parseFloat(value as string);
          requestData[key] = goal > 0 ? goal : 1; // Default to 1 if 0 or invalid
        } else {
          // Keep other fields as strings (title, description, creatorId, locationId)
          requestData[key] = value;
        }
      }
      // Ignore any other fields not in projectFields
    });
    
    // Add images array to requestData object (required field, must have at least 1 item)
    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }
    requestData.images = images;
    
    // Log the final payload for debugging
    console.log("Sending to backend:", {
      ...requestData,
      images: `[${requestData.images.length} image(s)]`,
    });

    // Get authorization header if present
    const authHeader = req.headers.get("authorization");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(`${backendUrl}/projects`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    // Try to parse response as JSON, fallback to text if it fails
    let responseData;
    try {
      responseData = await res.json();
    } catch (error) {
      const text = await res.text();
      console.error("Backend response (not JSON):", text);
      return NextResponse.json(
        { error: `Backend returned non-JSON response: ${text}` },
        { status: res.status }
      );
    }

    // Log error details for debugging
    if (!res.ok) {
      console.error("Backend error response:", {
        status: res.status,
        statusText: res.statusText,
        data: responseData,
      });
    }

    return NextResponse.json(responseData, { status: res.status });
  } catch (error) {
    console.error("Failed to create project:", error);
    const message = error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}