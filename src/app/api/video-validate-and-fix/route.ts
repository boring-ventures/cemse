import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";
import jwt from "jsonwebtoken";

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "course-videos";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("🔧 Video Fix API - Authenticated user:", decoded.username);

    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Extract filename from MinIO URL
    const urlParts = videoUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      return NextResponse.json(
        { error: "Invalid video URL - no filename" },
        { status: 400 }
      );
    }

    console.log("🔧 Video Fix API - Processing file:", fileName);

    try {
      // First, analyze the video
      const stat = await minioClient.statObject(BUCKET_NAME, fileName);
      const stream = await minioClient.getObject(BUCKET_NAME, fileName);

      // Read first few KB to analyze header
      const chunks: Buffer[] = [];
      let bytesRead = 0;
      const maxBytes = 2048;

      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
        bytesRead += (chunk as Buffer).length;
        if (bytesRead >= maxBytes) break;
      }

      const headerBuffer = Buffer.concat(chunks).subarray(0, maxBytes);
      const analysis = analyzeVideoHeader(headerBuffer);

      console.log("🔧 Video analysis result:", analysis);

      // If video is valid, no fix needed
      if (analysis.isValid && analysis.format === "mp4") {
        return NextResponse.json({
          status: "valid",
          message: "Video is already in a compatible format",
          analysis,
        });
      }

      // If video needs fixing, trigger re-encoding
      console.log("🔧 Video needs re-encoding, triggering conversion...");

      // Get the full video stream for conversion
      const fullStream = await minioClient.getObject(BUCKET_NAME, fileName);
      const videoChunks: Buffer[] = [];

      for await (const chunk of fullStream) {
        videoChunks.push(chunk as Buffer);
      }

      const videoBuffer = Buffer.concat(videoChunks);

      // Create a temporary file object for conversion
      const tempFile = new File([videoBuffer], fileName, {
        type: "video/mp4",
      });

      // Call the video conversion API
      const formData = new FormData();
      formData.append("video", tempFile);

      const conversionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api"}/video-convert`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!conversionResponse.ok) {
        const error = await conversionResponse.json();
        throw new Error(error.message || "Video conversion failed");
      }

      // Get the converted video
      const convertedVideoBuffer = await conversionResponse.arrayBuffer();
      const convertedBuffer = Buffer.from(convertedVideoBuffer);

      // Generate new filename for the fixed video
      const fixedFileName = fileName.replace(
        /\.(mp4|mov|avi|webm)$/i,
        "-fixed.mp4"
      );

      // Upload the fixed video to MinIO
      await minioClient.putObject(
        BUCKET_NAME,
        fixedFileName,
        convertedBuffer,
        convertedBuffer.length,
        {
          "Content-Type": "video/mp4",
          "x-amz-meta-original-file": fileName,
          "x-amz-meta-fixed-date": new Date().toISOString(),
        }
      );

      console.log("🔧 Video fix completed:", {
        originalFile: fileName,
        fixedFile: fixedFileName,
        originalSize: stat.size,
        fixedSize: convertedBuffer.length,
      });

      return NextResponse.json({
        status: "fixed",
        message: "Video has been re-encoded for compatibility",
        originalFile: fileName,
        fixedFile: fixedFileName,
        originalUrl: videoUrl,
        fixedUrl: videoUrl.replace(fileName, fixedFileName),
        analysis,
        conversionStatus: conversionResponse.headers.get("X-Conversion-Status"),
      });
    } catch (minioError) {
      console.error("🔧 Video Fix API - MinIO error:", minioError);
      return NextResponse.json(
        {
          error: "File not accessible",
          fileName,
          details:
            minioError instanceof Error ? minioError.message : "Unknown error",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("🔧 Video fix error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function analyzeVideoHeader(buffer: Buffer): {
  format: string;
  isValid: boolean;
  details: string;
  needsFix: boolean;
} {
  if (buffer.length < 12) {
    return {
      format: "unknown",
      isValid: false,
      details: "Buffer too small to analyze",
      needsFix: true,
    };
  }

  const headerHex = buffer.toString("hex", 0, 32);
  const headerText = buffer
    .toString("ascii", 0, 32)
    .replace(/[^\x20-\x7E]/g, ".");

  console.log("🔧 Header analysis:", {
    headerHex: headerHex.substring(0, 64),
    headerText,
  });

  // Check for MP4 signatures
  const ftypPos = buffer.indexOf("ftyp");
  if (ftypPos >= 0 && ftypPos <= 8) {
    const brandStart = ftypPos + 4;
    const brand = buffer.subarray(brandStart, brandStart + 4).toString("ascii");

    // Check if it's a compatible MP4 brand
    const compatibleBrands = ["mp41", "mp42", "isom", "iso2", "avc1"];
    const isCompatible = compatibleBrands.some((b) => brand.startsWith(b));

    return {
      format: "mp4",
      isValid: true,
      details: `MP4 container with brand: ${brand}`,
      needsFix: !isCompatible, // Fix if not using compatible brand
    };
  }

  // Check for other formats that definitely need conversion
  if (buffer.indexOf("RIFF") >= 0 && buffer.indexOf("AVI") >= 0) {
    return {
      format: "avi",
      isValid: true,
      details: "AVI container detected",
      needsFix: true,
    };
  }

  if (headerHex.startsWith("1a45dfa3")) {
    return {
      format: "webm",
      isValid: true,
      details: "WebM/Matroska container detected",
      needsFix: true,
    };
  }

  // Unknown or corrupted format
  return {
    format: "unknown",
    isValid: false,
    details: `Unrecognized format. Header: ${headerHex.substring(0, 24)}...`,
    needsFix: true,
  };
}
