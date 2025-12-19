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

    // Convert fileEntry to File or Blob, then to buffer
    let buffer: Buffer;
    let fileSize: number;
    let fileType: string;

    try {
      // Handle File instance
      if (fileEntry instanceof File) {
        fileSize = fileEntry.size;
        fileType = fileEntry.type || "image/jpeg";
        const bytes = await fileEntry.arrayBuffer();
        buffer = Buffer.from(bytes);
      }
      // Handle Blob instance (check if it's a Blob-like object)
      else if (fileEntry && typeof (fileEntry as any).arrayBuffer === 'function' && typeof (fileEntry as any).size === 'number') {
        const blobEntry = fileEntry as any;
        fileSize = blobEntry.size;
        fileType = blobEntry.type || "image/jpeg";
        const bytes = await blobEntry.arrayBuffer();
        buffer = Buffer.from(bytes);
      }
      // Handle other types (Next.js might return different types)
      else {
        // Try to get the file as a blob using Response
        const blob = fileEntry as any;
        
        // If it has a stream method, use it
        if (blob.stream && typeof blob.stream === 'function') {
          const stream = blob.stream();
          const reader = stream.getReader();
          const chunks: Uint8Array[] = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          
          // Combine chunks into single buffer
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const combined = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }
          
          buffer = Buffer.from(combined);
          fileSize = buffer.length;
          fileType = blob.type || "image/jpeg";
        }
        // Try to convert using Response API (most reliable fallback)
        else {
          // Use Response to convert any file-like object to a buffer
          const response = new Response(blob);
          const bytes = await response.arrayBuffer();
          buffer = Buffer.from(bytes);
          fileSize = buffer.length;
          fileType = blob.type || (blob as any).mimeType || "image/jpeg";
        }
      }
    } catch (error) {
      console.error("Error processing file:", error);
      return NextResponse.json(
        { error: `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 5MB limit. Your file is ${(fileSize / 1024 / 1024).toFixed(2)}MB. Please compress or resize the image.` },
        { status: 400 }
      );
    }

    // Convert buffer to base64 string for Cloudinary
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

