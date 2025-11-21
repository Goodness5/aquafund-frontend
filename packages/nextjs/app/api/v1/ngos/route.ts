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
    const {
      organizationName,
      yearEstablished,
      countryOfOperation,
      ngoIdentificationNumber,
      emailAddress,
      missionStatement,
      websiteOrSocialLinks,
      contactPersonName,
      contactPersonPosition,
      contactPersonPhoneNumber,
      contactPersonResidentialAddress,
      contactPersonEmailAddress,
      orgImages,
      connectedWallet,
      userId,
    } = body;

    // Check for required fields
    const requiredFields = {
      organizationName,
      yearEstablished,
      countryOfOperation,
      ngoIdentificationNumber,
      emailAddress,
      missionStatement,
      websiteOrSocialLinks,
      contactPersonName,
      contactPersonPosition,
      contactPersonPhoneNumber,
      contactPersonResidentialAddress,
      contactPersonEmailAddress,
      connectedWallet,
      userId,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress) || !emailRegex.test(contactPersonEmailAddress)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate yearEstablished is a number
    if (typeof yearEstablished !== "number" || yearEstablished < 1800 || yearEstablished > new Date().getFullYear()) {
      return NextResponse.json(
        { error: "Invalid year established. Must be a valid year." },
        { status: 400 }
      );
    }

    // Validate orgImages is an array
    if (!Array.isArray(orgImages)) {
      return NextResponse.json(
        { error: "orgImages must be an array" },
        { status: 400 }
      );
    }

    // Prepare the request body with all required fields
    const requestBody = {
      organizationName,
      yearEstablished,
      countryOfOperation,
      ngoIdentificationNumber,
      emailAddress,
      missionStatement,
      websiteOrSocialLinks,
      contactPersonName,
      contactPersonPosition,
      contactPersonPhoneNumber,
      contactPersonResidentialAddress,
      contactPersonEmailAddress,
      orgCountryOfOperation: countryOfOperation, // Using same value as countryOfOperation
      orgEmailAddress: emailAddress, // Using same value as emailAddress
      orgDescription: missionStatement, // Using same value as missionStatement
      orgImages,
      connectedWallet,
      statusVerification: "PENDING",
      userId,
    };

    const backendEndpoint = `${backendUrl}/ngos`;
    const res = await fetch(backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Check if response is JSON before parsing
    const responseContentType = res.headers.get("content-type");
    
    // Provide helpful error message based on status
    let errorMessage = `Backend returned error: ${res.status} ${res.statusText}`;
    if (res.status === 404) {
      errorMessage = `Backend endpoint not found. Please verify that the endpoint exists at: ${backendEndpoint}`;
    } else if (res.status === 413) {
      errorMessage = `Payload too large (413). The request body exceeds the server's size limit. Please reduce image sizes or send fewer images.`;
    }
    
    if (responseContentType && responseContentType.includes("application/json")) {
      try {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (parseError) {
        // If JSON parsing fails, return error
        return NextResponse.json(
          { 
            error: errorMessage,
            details: res.status === 413 ? "Try reducing image sizes or sending fewer images." : undefined
          },
          { status: res.status || 502 }
        );
      }
    } else {
      // If backend returns non-JSON (like HTML error page), return a proper error
      try {
        const text = await res.text();
        return NextResponse.json(
          { 
            error: errorMessage,
            details: res.status === 404 
              ? "The backend API endpoint does not exist or the backend URL is incorrect."
              : res.status === 413
              ? "Try reducing image sizes or sending fewer images."
              : undefined
          },
          { status: res.status || 502 }
        );
      } catch (textError) {
        // If we can't read the text, just return the error message
        return NextResponse.json(
          { 
            error: errorMessage,
            details: res.status === 413 ? "Try reducing image sizes or sending fewer images." : undefined
          },
          { status: res.status || 502 }
        );
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create NGO";
    const status = message === "Backend URL not set" ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

