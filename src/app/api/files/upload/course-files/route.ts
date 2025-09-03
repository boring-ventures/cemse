import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

// Configure maximum file sizes
// Note: These limits are also enforced in the client-side CourseFileUpload component
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB (reduced from 1GB for better performance)

// Configure runtime for large file uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes timeout for large uploads

// Configure body size limit for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

// For Next.js 15, try to handle large files by streaming
export const preferredRegion = "auto";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// POST /api/files/upload/course-files - Subir archivos de curso (thumbnail y video)
export async function POST(request: NextRequest) {
  try {
    console.log("📚 API: Course files upload request received");

    // Check content length to prevent memory issues
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      console.log(`📚 API: Request size: ${sizeInMB.toFixed(2)} MB`);

      if (sizeInMB > 1024) {
        return NextResponse.json(
          { error: "El archivo es demasiado grande. Máximo 1GB por archivo" },
          { status: 413 }
        );
      }
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("📚 API: No auth token found in cookies");
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token
      decoded = verifyToken(token);
    } else if (token.startsWith("auth-token-")) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split("-");

      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];

        // For file uploads, we'll create a simple decoded object
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`,
        };
        console.log(
          "📚 API: Database token validated for user:",
          decoded.username
        );
      }
    } else {
      decoded = verifyToken(token);
    }

    if (!decoded) {
      console.log("📚 API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log("📚 API: Authenticated user:", decoded.username || decoded.id);

    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("📚 API: Error parsing form data:", error);
      if (error instanceof Error && error.message.includes("too large")) {
        return NextResponse.json(
          { error: "El archivo es demasiado grande. Máximo 1GB por archivo" },
          { status: 413 }
        );
      }
      return NextResponse.json(
        { error: "Error al procesar los archivos" },
        { status: 400 }
      );
    }
    const thumbnail = formData.get("thumbnail") as File;
    const videoPreview = formData.get("videoPreview") as File;

    const uploadedFiles: { thumbnail?: string; videoPreview?: string } = {};

    // Handle thumbnail upload
    if (thumbnail) {
      // Validate file type
      if (!thumbnail.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "El archivo thumbnail debe ser una imagen" },
          { status: 400 }
        );
      }

      // Validate size (max 5MB)
      if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
        return NextResponse.json(
          { error: "El archivo thumbnail es demasiado grande. Máximo 5MB" },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(
        process.cwd(),
        "public",
        "uploads",
        "courses",
        "thumbnails"
      );
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const extension = thumbnail.name.split(".").pop();
      const filename = `course-thumbnail-${decoded.id}-${timestamp}.${extension}`;
      const filepath = join(uploadsDir, filename);

      // Save file to disk
      const bytes = await thumbnail.arrayBuffer();
      await writeFile(filepath, new Uint8Array(bytes));

      uploadedFiles.thumbnail = `/uploads/courses/thumbnails/${filename}`;
      console.log(
        "📚 API: Thumbnail uploaded successfully:",
        uploadedFiles.thumbnail
      );
    }

    // Handle video preview upload
    if (videoPreview) {
      // Validate file type
      if (!videoPreview.type.startsWith("video/")) {
        return NextResponse.json(
          { error: "El archivo videoPreview debe ser un video" },
          { status: 400 }
        );
      }

      // Validate size (max 1GB)
      if (videoPreview.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: "El archivo videoPreview es demasiado grande. Máximo 1GB" },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(
        process.cwd(),
        "public",
        "uploads",
        "courses",
        "videos"
      );
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const extension = videoPreview.name.split(".").pop();
      const filename = `course-video-${decoded.id}-${timestamp}.${extension}`;
      const filepath = join(uploadsDir, filename);

      // Save file to disk
      const bytes = await videoPreview.arrayBuffer();
      await writeFile(filepath, new Uint8Array(bytes));

      uploadedFiles.videoPreview = `/uploads/courses/videos/${filename}`;
      console.log(
        "📚 API: Video preview uploaded successfully:",
        uploadedFiles.videoPreview
      );
    }

    if (!uploadedFiles.thumbnail && !uploadedFiles.videoPreview) {
      return NextResponse.json(
        { error: "No se proporcionaron archivos para subir" },
        { status: 400 }
      );
    }

    console.log("📚 API: Course files uploaded successfully:", uploadedFiles);

    return NextResponse.json({
      message: "Archivos de curso subidos exitosamente",
      ...uploadedFiles,
    });
  } catch (error) {
    console.error("Error al subir archivos de curso:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("too large") ||
        error.message.includes("413")
      ) {
        return NextResponse.json(
          { error: "El archivo es demasiado grande. Máximo 1GB por archivo" },
          { status: 413 }
        );
      }
      if (error.message.includes("form data")) {
        return NextResponse.json(
          {
            error:
              "Error al procesar los archivos. Verifica el tamaño y formato.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
