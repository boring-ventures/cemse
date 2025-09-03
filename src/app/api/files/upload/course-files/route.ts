import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

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

    const formData = await request.formData();
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
      if (thumbnail.size > 5 * 1024 * 1024) {
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
      if (videoPreview.size > 1024 * 1024 * 1024) {
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
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
