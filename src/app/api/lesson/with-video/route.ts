import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { Client } from "minio";
import { LessonType } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "course-videos";

export async function POST(request: NextRequest) {
  try {
    console.log("🎥 API: Received POST request for lesson with video upload");

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
    console.log("🎥 API: Authenticated user:", decoded.username);

    const formData = await request.formData();

    // Extract lesson data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const moduleId = formData.get("moduleId") as string;
    const contentType = formData.get("contentType") as string;
    const duration = parseInt(formData.get("duration") as string) || 0;
    const orderIndex = parseInt(formData.get("orderIndex") as string) || 0;
    const isRequired = formData.get("isRequired") === "true";
    const isPreview = formData.get("isPreview") === "true";

    // Get video file
    const videoFile = formData.get("video") as File;
    if (!videoFile) {
      return NextResponse.json(
        { message: "Video file is required" },
        { status: 400 }
      );
    }

    console.log(
      "🎥 Processing video file:",
      videoFile.name,
      "Size:",
      videoFile.size
    );

    // Generate unique filename - always use MP4 since conversion produces MP4
    let fileExtension = "mp4";
    
    // If the file was converted, it should be MP4
    if (videoFile.type && videoFile.type.includes("mp4")) {
      fileExtension = "mp4";
    } else if (videoFile.type && videoFile.type.includes("webm")) {
      // Legacy: if somehow a WebM file comes through, still save as webm  
      fileExtension = "webm";
    }
    
    // Always prefer MP4 for maximum compatibility
    fileExtension = "mp4";
    
    const fileName = `lesson-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    console.log("🎥 File details:", {
      originalName: videoFile.name,
      mimeType: videoFile.type,
      detectedExtension: fileExtension,
      finalFileName: fileName
    });

    try {
      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(BUCKET_NAME);
        console.log("🎥 Created bucket:", BUCKET_NAME);
      }

      // Convert File to Buffer
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate video file before upload
      if (buffer.length === 0) {
        throw new Error("Video file is empty after processing");
      }
      
      if (buffer.length > 500 * 1024 * 1024) {
        throw new Error("Video file is too large (>500MB)");
      }
      
      console.log("🎥 Uploading video to MinIO...", {
        fileName,
        fileSize: buffer.length,
        originalSize: videoFile.size,
        mimeType: videoFile.type
      });
      
      // Upload video to MinIO
      await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        buffer,
        buffer.length,
        {
          "Content-Type": videoFile.type || "video/mp4",
          "Cache-Control": "public, max-age=31536000", // 1 year cache
          "Content-Disposition": "inline", // Allow inline viewing
        }
      );
      
      // Verify upload by checking object info
      const objectInfo = await minioClient.statObject(BUCKET_NAME, fileName);
      console.log("✅ Video upload verified:", {
        fileName,
        uploadedSize: objectInfo.size,
        etag: objectInfo.etag,
        lastModified: objectInfo.lastModified
      });
      
      if (objectInfo.size !== buffer.length) {
        throw new Error(`Upload size mismatch: expected ${buffer.length}, got ${objectInfo.size}`);
      }

      // Generate video URL
      const videoUrl = `http://${process.env.MINIO_ENDPOINT || "127.0.0.1"}:${process.env.MINIO_PORT || "9000"}/${BUCKET_NAME}/${fileName}`;

      console.log("🎥 Video uploaded successfully:", videoUrl);

      // Create lesson in database
      const lesson = await prisma.lesson.create({
        data: {
          moduleId,
          title,
          description,
          content,
          contentType: contentType as LessonType,
          videoUrl,
          duration,
          orderIndex,
          isRequired,
          isPreview,
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

      console.log("✅ Lesson with video created successfully:", lesson.id);
      return NextResponse.json({ lesson }, { status: 201 });
    } catch (minioError) {
      console.error("❌ MinIO upload error:", minioError);
      return NextResponse.json(
        {
          message: "Failed to upload video",
          error:
            process.env.NODE_ENV === "development"
              ? (minioError as Error).message
              : "Upload failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error creating lesson with video:", error);

    const errorDetails =
      error instanceof Error
        ? {
            message: error.message,
            code: (error as any).code,
            meta: (error as any).meta,
          }
        : { message: "Unknown error" };

    console.error("❌ Error details:", errorDetails);

    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? errorDetails.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🎥 API: Received PUT request for lesson video update");

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
    console.log("🎥 API: Authenticated user:", decoded.username);

    const formData = await request.formData();

    // Extract lesson data
    const lessonId = formData.get("lessonId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const moduleId = formData.get("moduleId") as string;
    const contentType = formData.get("contentType") as string;
    const duration = parseInt(formData.get("duration") as string) || 0;
    const orderIndex = parseInt(formData.get("orderIndex") as string) || 0;
    const isRequired = formData.get("isRequired") === "true";
    const isPreview = formData.get("isPreview") === "true";

    if (!lessonId) {
      return NextResponse.json(
        { message: "Lesson ID is required for update" },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get video file (optional for updates)
    const videoFile = formData.get("video") as File;
    let videoUrl = existingLesson.videoUrl; // Keep existing video URL by default

    if (videoFile) {
      console.log(
        "🎥 Processing new video file:",
        videoFile.name,
        "Size:",
        videoFile.size
      );

      // Generate unique filename with proper extension based on MIME type
      let fileExtension = "mp4"; // Default fallback
      if (videoFile.type) {
        if (videoFile.type.includes("webm")) {
          fileExtension = "webm";
        } else if (videoFile.type.includes("mp4")) {
          fileExtension = "mp4";
        } else if (videoFile.type.includes("avi")) {
          fileExtension = "avi";
        } else if (videoFile.type.includes("mov") || videoFile.type.includes("quicktime")) {
          fileExtension = "mov";
        }
      }
      
      const fileName = `lesson-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      console.log("🎥 File details for update:", {
        originalName: videoFile.name,
        mimeType: videoFile.type,
        detectedExtension: fileExtension,
        finalFileName: fileName
      });

      try {
        // Ensure bucket exists
        const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
          await minioClient.makeBucket(BUCKET_NAME);
          console.log("🎥 Created bucket:", BUCKET_NAME);
        }

        // Convert File to Buffer
        const arrayBuffer = await videoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Validate video file before upload
        if (buffer.length === 0) {
          throw new Error("Video file is empty after processing");
        }
        
        console.log("🎥 Uploading new video to MinIO...", {
          fileName,
          fileSize: buffer.length,
          originalSize: videoFile.size,
          mimeType: videoFile.type
        });
        
        // Upload new video to MinIO
        await minioClient.putObject(
          BUCKET_NAME,
          fileName,
          buffer,
          buffer.length,
          {
            "Content-Type": videoFile.type || "video/mp4",
            "Cache-Control": "public, max-age=31536000",
            "Content-Disposition": "inline",
          }
        );
        
        // Verify upload
        const objectInfo = await minioClient.statObject(BUCKET_NAME, fileName);
        console.log("✅ Video update upload verified:", {
          fileName,
          uploadedSize: objectInfo.size,
          etag: objectInfo.etag
        });

        // Generate new video URL
        videoUrl = `http://${process.env.MINIO_ENDPOINT || "127.0.0.1"}:${process.env.MINIO_PORT || "9000"}/${BUCKET_NAME}/${fileName}`;

        console.log("🎥 New video uploaded successfully:", videoUrl);

        // TODO: Delete old video file from MinIO if it exists
        // This would require parsing the old URL and extracting the filename
      } catch (minioError) {
        console.error("❌ MinIO upload error:", minioError);
        return NextResponse.json(
          {
            message: "Failed to upload video",
            error:
              process.env.NODE_ENV === "development"
                ? (minioError as Error).message
                : "Upload failed",
          },
          { status: 500 }
        );
      }
    }

    // Update lesson in database
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        description,
        content,
        contentType: contentType as LessonType,
        videoUrl,
        duration,
        orderIndex,
        isRequired,
        isPreview,
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

    console.log("✅ Lesson with video updated successfully:", lesson.id);
    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating lesson with video:", error);

    const errorDetails =
      error instanceof Error
        ? {
            message: error.message,
            code: (error as any).code,
            meta: (error as any).meta,
          }
        : { message: "Unknown error" };

    console.error("❌ Error details:", errorDetails);

    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? errorDetails.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
