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

    console.log("🎥 Video Proxy - Serving file:", {
      fileName,
      originalUrl: videoUrl,
      range: request.headers.get("range"),
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      method: request.method,
    });

    // Get range header for streaming
    const range = request.headers.get("range");

    if (range) {
      console.log("🎥 Video Proxy - Range request:", range);
    }

    try {
      // Get object info first
      const stat = await minioClient.statObject(BUCKET_NAME, fileName);
      console.log("🎥 Video Proxy - File stat:", {
        size: stat.size,
        etag: stat.etag,
        lastModified: stat.lastModified,
        contentType: stat.metaData["content-type"],
      });

      // Validate and fix content-type for video files
      let contentType = stat.metaData["content-type"] || "video/mp4";
      const extension = fileName.toLowerCase().split(".").pop();

      console.log("🎥 Video Proxy - Content type analysis:", {
        originalContentType: stat.metaData["content-type"],
        fileName,
        extension,
        fileSize: stat.size,
      });

      // Fix common content-type issues and ensure correct MIME type
      if (
        !contentType.startsWith("video/") ||
        contentType === "application/octet-stream"
      ) {
        // Try to determine content-type from filename
        switch (extension) {
          case "mp4":
            contentType = "video/mp4";
            break;
          case "webm":
            contentType = "video/webm";
            break;
          case "mov":
            contentType = "video/quicktime";
            break;
          case "avi":
            contentType = "video/x-msvideo";
            break;
          default:
            contentType = "video/mp4"; // Default fallback
        }
        console.log(
          "✅ Video Proxy - Fixed content-type:",
          stat.metaData["content-type"],
          "->",
          contentType
        );
      }

      // Validate file is not empty or corrupted
      if (stat.size === 0) {
        console.error("❌ Video Proxy - File is empty:", fileName);
        return NextResponse.json(
          { error: "Video file is empty or corrupted", fileName },
          { status: 500 }
        );
      }

      if (stat.size < 1024) {
        // Less than 1KB is suspicious for video
        console.warn("⚠️ Video Proxy - File seems too small for a video:", {
          fileName,
          size: stat.size,
        });
      }

      // Get the object stream
      console.log("🎥 Video Proxy - Fetching object from MinIO:", fileName);
      const stream = await minioClient.getObject(BUCKET_NAME, fileName);

      // Prepare response headers with better caching and video-specific headers
      const responseHeaders: Record<string, string> = {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Range",
        "Access-Control-Expose-Headers":
          "Content-Range, Accept-Ranges, Content-Length",
        ETag: stat.etag,
        "Last-Modified": stat.lastModified.toUTCString(),
      };

      // Handle range requests for video streaming
      if (range) {
        console.log("🎥 Video Proxy - Processing range request:", range);

        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10) || 0;
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunkSize = end - start + 1;

        // Validate range
        if (start >= stat.size || end >= stat.size || start > end) {
          console.error("🎥 Video Proxy - Invalid range request:", {
            start,
            end,
            fileSize: stat.size,
          });
          return NextResponse.json(
            { error: "Invalid range" },
            {
              status: 416,
              headers: { "Content-Range": `bytes */${stat.size}` },
            }
          );
        }

        responseHeaders["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
        responseHeaders["Content-Length"] = chunkSize.toString();

        console.log("➡️ Video Proxy - Serving range:", {
          fileName,
          start,
          end,
          chunkSize,
          totalSize: stat.size,
          contentType,
        });

        // For range requests, get the specific range from MinIO
        try {
          const rangeStream = await minioClient.getPartialObject(
            BUCKET_NAME,
            fileName,
            start,
            chunkSize
          );

          return new NextResponse(rangeStream as any, {
            status: 206, // Partial Content
            headers: responseHeaders,
          });
        } catch (rangeError) {
          console.error("🎥 Video Proxy - Range request error:", rangeError);

          // Fallback: get full stream and let client handle it
          const fallbackStream = await minioClient.getObject(
            BUCKET_NAME,
            fileName
          );
          return new NextResponse(fallbackStream as any, {
            status: 206,
            headers: responseHeaders,
          });
        }
      }

      // For large files (>1MB), suggest range requests by sending 206 with full content
      // This helps browsers understand they should use range requests for better streaming
      const fileSizeMB = stat.size / (1024 * 1024);
      const isLargeFile = fileSizeMB > 1;

      console.log("🎥 Video Proxy - Serving full file:", {
        size: stat.size,
        sizeMB: fileSizeMB.toFixed(2),
        contentType,
        isLargeFile,
        suggestRangeRequests: isLargeFile,
      });

      if (isLargeFile) {
        // For large files, set up headers to encourage range requests
        responseHeaders["Content-Range"] =
          `bytes 0-${stat.size - 1}/${stat.size}`;
        responseHeaders["Accept-Ranges"] = "bytes";

        console.log(
          "🎥 Video Proxy - Large file detected, encouraging range requests"
        );

        return new NextResponse(stream as any, {
          status: 206, // Use 206 to indicate partial content capability
          headers: responseHeaders,
        });
      } else {
        // For small files, serve normally
        return new NextResponse(stream as any, {
          status: 200,
          headers: responseHeaders,
        });
      }
    } catch (minioError) {
      console.error("🎥 Video Proxy - MinIO error:", minioError);

      // Provide more specific error information
      if (minioError instanceof Error) {
        if (minioError.message.includes("does not exist")) {
          return NextResponse.json(
            { error: "Video file not found", fileName },
            { status: 404 }
          );
        } else if (minioError.message.includes("access denied")) {
          return NextResponse.json(
            { error: "Access denied to video file", fileName },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { error: "Internal server error accessing video", fileName },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🎥 Video Proxy - Critical Error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      videoUrl: request.nextUrl.searchParams.get("url"),
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
    });

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const isNetworkError =
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ETIMEDOUT");
    const isMinIOError =
      errorMessage.includes("NoSuchKey") ||
      errorMessage.includes("AccessDenied");

    return NextResponse.json(
      {
        error: "Video proxy failed",
        details: isNetworkError
          ? "Cannot connect to MinIO server"
          : isMinIOError
            ? "Video file not found in MinIO"
            : errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: isNetworkError ? 503 : isMinIOError ? 404 : 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Range",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function HEAD(request: NextRequest) {
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

    console.log("🎥 Video Proxy HEAD - Getting headers for:", fileName);

    try {
      // Get object info
      const stat = await minioClient.statObject(BUCKET_NAME, fileName);

      // Fix content-type for video files (same logic as GET request)
      let contentType = stat.metaData["content-type"] || "video/mp4";
      if (!contentType.startsWith("video/")) {
        const extension = fileName.toLowerCase().split(".").pop();
        switch (extension) {
          case "mp4":
            contentType = "video/mp4";
            break;
          case "webm":
            contentType = "video/webm";
            break;
          case "mov":
            contentType = "video/quicktime";
            break;
          case "avi":
            contentType = "video/x-msvideo";
            break;
          default:
            contentType = "video/mp4";
        }
      }

      console.log("🎥 Video Proxy HEAD - Content-Type:", contentType);
      console.log("🎥 Video Proxy HEAD - Content-Length:", stat.size);

      // Return headers
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD",
          "Access-Control-Allow-Headers": "Range",
        },
      });
    } catch (minioError) {
      console.error("🎥 Video Proxy HEAD - MinIO error:", minioError);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("🎥 Video proxy HEAD error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
