import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "course-videos";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json(
        { error: "URL parameter is required" },
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

    console.log("🔍 Video Diagnostic - Analyzing file:", fileName);

    try {
      // Get object info
      const stat = await minioClient.statObject(BUCKET_NAME, fileName);

      // Get first few bytes to analyze file header
      const stream = await minioClient.getObject(BUCKET_NAME, fileName);
      const chunks: Buffer[] = [];
      let bytesRead = 0;
      const maxBytes = 1024; // Read first 1KB for analysis

      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
        bytesRead += (chunk as Buffer).length;
        if (bytesRead >= maxBytes) break;
      }

      const headerBuffer = Buffer.concat(chunks).subarray(0, maxBytes);

      // Analyze file header for video format
      const diagnostic = {
        fileName,
        fileSize: stat.size,
        contentType: stat.metaData["content-type"],
        lastModified: stat.lastModified,
        etag: stat.etag,
        headerAnalysis: analyzeVideoHeader(headerBuffer),
        recommendations: [] as string[],
      };

      // Add recommendations based on analysis
      if (
        !diagnostic.contentType ||
        !diagnostic.contentType.startsWith("video/")
      ) {
        diagnostic.recommendations.push(
          "File missing video content-type metadata"
        );
      }

      if (diagnostic.headerAnalysis.format === "unknown") {
        diagnostic.recommendations.push(
          "Video format not recognized - may be corrupted or unsupported"
        );
      }

      if (diagnostic.fileSize < 1000) {
        diagnostic.recommendations.push(
          "File size suspiciously small - may be corrupted"
        );
      }

      if (
        diagnostic.headerAnalysis.format &&
        !["mp4", "webm", "avi"].includes(diagnostic.headerAnalysis.format)
      ) {
        diagnostic.recommendations.push(
          `Format '${diagnostic.headerAnalysis.format}' may not be browser-compatible`
        );
      }

      return NextResponse.json(diagnostic);
    } catch (minioError) {
      console.error("🔍 Video Diagnostic - MinIO error:", minioError);
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
    console.error("🔍 Video diagnostic error:", error);
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
} {
  if (buffer.length < 12) {
    return {
      format: "unknown",
      isValid: false,
      details: "Buffer too small to analyze",
    };
  }

  const header = buffer.subarray(0, 32); // Read more bytes for better analysis
  const headerHex = header.toString("hex");
  const headerText = buffer.subarray(0, 32).toString("ascii", 0, 32);

  console.log("🔍 Video header analysis:", {
    headerHex: headerHex.substring(0, 64),
    headerText: headerText.replace(/[^\x20-\x7E]/g, "."),
    bufferLength: buffer.length,
  });

  // Check for MP4/M4V signatures with more variations
  const ftypPos = buffer.indexOf("ftyp");
  if (ftypPos >= 0 && ftypPos <= 8) {
    const brandStart = ftypPos + 4;
    const brand = buffer.subarray(brandStart, brandStart + 4).toString("ascii");

    console.log("🔍 Found ftyp box at position", ftypPos, "with brand:", brand);

    // Check for various MP4 brands
    const mp4Brands = [
      "mp41",
      "mp42",
      "mp4v",
      "M4V ",
      "M4A ",
      "isom",
      "iso2",
      "avc1",
      "qt  ",
    ];
    if (mp4Brands.some((brandCheck) => brand.startsWith(brandCheck.trim()))) {
      return {
        format: "mp4",
        isValid: true,
        details: `Valid MP4 container detected (brand: ${brand})`,
      };
    }

    return {
      format: "mp4",
      isValid: true,
      details: `MP4 container with brand: ${brand}`,
    };
  }

  // Alternative MP4 detection - look for common MP4 patterns
  if (headerHex.includes("667479706d70")) {
    // "ftypmp" in hex
    return {
      format: "mp4",
      isValid: true,
      details: "MP4 container detected via hex pattern",
    };
  }

  if (headerText.includes("RIFF") && headerText.includes("AVI")) {
    return {
      format: "avi",
      isValid: true,
      details: "AVI container detected",
    };
  }

  if (headerHex.startsWith("1a45dfa3")) {
    return {
      format: "webm",
      isValid: true,
      details: "WebM/Matroska container detected",
    };
  }

  if (headerHex.startsWith("464c5601")) {
    return {
      format: "flv",
      isValid: false,
      details: "FLV format detected (not browser compatible)",
    };
  }

  // Check for corrupted or incomplete files
  if (buffer.every((byte) => byte === 0)) {
    return {
      format: "unknown",
      isValid: false,
      details: "File appears to be empty or filled with zeros",
    };
  }

  return {
    format: "unknown",
    isValid: false,
    details: `Unrecognized format. Header: ${headerHex.substring(0, 24)}...`,
  };
}
