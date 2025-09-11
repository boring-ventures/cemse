import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  unlink,
  rmdir,
} from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Client } from "minio";
import { LessonType } from "@prisma/client";

// Configure runtime for finalizing uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes timeout for finalization
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "course-videos";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// POST /api/lesson/upload/finalize - Combine all chunks into final lesson video
export async function POST(request: NextRequest) {
  try {
    console.log("🎥 Lesson Finalize API: Finalize upload request received");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("🎥 Lesson Finalize API: No auth token found in cookies");
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes(".") && token.split(".").length === 3) {
      decoded = verifyToken(token);
    } else if (token.startsWith("auth-token-")) {
      const tokenParts = token.split("-");
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`,
        };
      }
    } else {
      decoded = verifyToken(token);
    }

    if (!decoded) {
      console.log("🎥 Lesson Finalize API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;
    const lessonData = JSON.parse(formData.get("lessonData") as string);

    if (!sessionId || !lessonData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read metadata
    const tempDir = join(process.cwd(), "temp", "lesson-chunks", sessionId);
    const metadataPath = join(tempDir, "metadata.json");

    let metadata;
    try {
      const metadataContent = await readFile(metadataPath, "utf-8");
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      return NextResponse.json(
        { error: "Upload session not found or invalid" },
        { status: 400 }
      );
    }

    // Verify all chunks are uploaded
    const expectedChunks = Array.from(
      { length: metadata.totalChunks },
      (_, i) => i + 1
    );
    const uploadedChunks = [];

    for (let i = 1; i <= metadata.totalChunks; i++) {
      const chunkPath = join(tempDir, `chunk-${i.toString().padStart(3, "0")}`);
      try {
        await readFile(chunkPath);
        uploadedChunks.push(i);
      } catch (error) {
        // Chunk not found
      }
    }

    if (uploadedChunks.length !== metadata.totalChunks) {
      return NextResponse.json(
        {
          error: `Missing chunks. Expected ${metadata.totalChunks}, got ${uploadedChunks.length}`,
        },
        { status: 400 }
      );
    }

    console.log(
      `🎥 Lesson Finalize API: All ${metadata.totalChunks} chunks found, combining...`
    );

    // Combine chunks into final file
    const finalFileBuffer = Buffer.alloc(metadata.fileSize);
    let offset = 0;

    for (let i = 1; i <= metadata.totalChunks; i++) {
      const chunkPath = join(tempDir, `chunk-${i.toString().padStart(3, "0")}`);
      const chunkBuffer = await readFile(chunkPath);

      chunkBuffer.copy(finalFileBuffer, offset);
      offset += chunkBuffer.length;
    }

    console.log(
      `🎥 Lesson Finalize API: File combined successfully: ${(finalFileBuffer.length / (1024 * 1024)).toFixed(2)} MB`
    );

    // Upload to MinIO
    try {
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(BUCKET_NAME);
        console.log("🎥 Lesson Finalize API: Created bucket:", BUCKET_NAME);
      }

      // Generate unique filename
      const fileExtension = "mp4"; // Always use MP4 for lesson videos
      const fileName = `lesson-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

      console.log("🎥 Lesson Finalize API: Uploading to MinIO...", {
        fileName,
        fileSize: finalFileBuffer.length,
      });

      // Upload video to MinIO
      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        finalFileBuffer,
        finalFileBuffer.length,
        {
          "Content-Type": metadata.mimeType || "video/mp4",
          "Cache-Control": "public, max-age=31536000", // 1 year cache
          "Content-Disposition": "inline", // Allow inline viewing
        }
      );

      // Verify upload
      const objectInfo = await minioClient.statObject(BUCKET_NAME, fileName);
      console.log("✅ Lesson Finalize API: Video upload verified:", {
        fileName,
        uploadedSize: objectInfo.size,
        etag: objectInfo.etag,
      });

      if (objectInfo.size !== finalFileBuffer.length) {
        throw new Error(`Upload size mismatch: expected ${finalFileBuffer.length}, got ${objectInfo.size}`);
      }

      // Generate video URL
      const videoUrl = `http://${process.env.MINIO_ENDPOINT || "127.0.0.1"}:${process.env.MINIO_PORT || "9000"}/${BUCKET_NAME}/${fileName}`;

      console.log("🎥 Lesson Finalize API: Video uploaded successfully:", videoUrl);

      // Create lesson in database
      const lesson = await prisma.lesson.create({
        data: {
          moduleId: metadata.moduleId,
          title: lessonData.title,
          description: lessonData.description || "",
          content: lessonData.content || "",
          contentType: "VIDEO" as LessonType,
          videoUrl,
          duration: lessonData.duration || 0,
          orderIndex: lessonData.orderIndex || 0,
          isRequired: lessonData.isRequired || true,
          isPreview: lessonData.isPreview || false,
          attachments: [],
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
          resources: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      console.log("✅ Lesson Finalize API: Lesson created successfully:", lesson.id);

      // Clean up temporary files
      try {
        const files = await readdir(tempDir);
        for (const file of files) {
          await unlink(join(tempDir, file));
        }
        await rmdir(tempDir);
        console.log(
          `🎥 Lesson Finalize API: Temporary files cleaned up for session ${sessionId}`
        );
      } catch (error) {
        console.warn(
          `🎥 Lesson Finalize API: Warning: Could not clean up temporary files:`,
          error
        );
      }

      return NextResponse.json({
        message: "Lesson video upload finalized successfully",
        lesson,
        videoUrl,
        fileName,
        fileSize: finalFileBuffer.length,
        sessionId,
      });
    } catch (minioError) {
      console.error("❌ Lesson Finalize API: MinIO upload error:", minioError);
      return NextResponse.json(
        {
          error: "Failed to upload video to storage",
          details: process.env.NODE_ENV === "development" ? (minioError as Error).message : "Upload failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🎥 Lesson Finalize API: Error finalizing upload:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
