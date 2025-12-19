import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export async function POST(req: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!fileEntry) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Ensure we have a File or Blob object
    if (!(fileEntry instanceof File) && !(fileEntry instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file type. Expected File or Blob." },
        { status: 400 }
      );
    }

    const file = fileEntry as File | Blob;

    // Check file size (5MB limit) - File has size property, Blob might not
    const fileSize = file instanceof File ? file.size : (file as any).size || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 5MB limit. Your file is ${(fileSize / 1024 / 1024).toFixed(2)}MB. Please compress or resize the image.` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 string for Cloudinary
    // Get file type - File has type property, Blob might not
    const fileType = file instanceof File ? file.type : (file as any).type || "image/jpeg";
    const base64String = `data:${fileType};base64,${buffer.toString("base64")}`;

    // Get folder from form data (default to ngo-documents for backward compatibility)
    const folder = (formData.get("folder") as string) || "aquafund/ngo-documents";
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          resource_type: "auto", // Automatically detect image, video, or raw
          folder: folder, // Use specified folder or default
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Extract secure URL from result
    const result = uploadResult as { secure_url: string; public_id: string };
    
    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image to Cloudinary";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

