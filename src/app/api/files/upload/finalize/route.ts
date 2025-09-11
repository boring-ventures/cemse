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

// Configure runtime for finalizing uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes timeout for finalization (increased for large files)
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// POST /api/files/upload/finalize - Combine all chunks into final file
export async function POST(request: NextRequest) {
  try {
    console.log("📁 Finalize API: Finalize upload request received");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("📁 Finalize API: No auth token found in cookies");
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
      console.log("📁 Finalize API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;
    const fileType = formData.get("fileType") as string;

    if (!sessionId || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read metadata
    const tempDir = join(process.cwd(), "temp", "chunks", sessionId);
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
      `📁 Finalize API: All ${metadata.totalChunks} chunks found, combining...`
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

    // Create final uploads directory
    let uploadsDir;
    let finalFileName;

    if (fileType === "thumbnail") {
      uploadsDir = join(
        process.cwd(),
        "public",
        "uploads",
        "courses",
        "thumbnails"
      );
      finalFileName = `course-thumbnail-${decoded.id}-${Date.now()}.${metadata.fileName.split(".").pop()}`;
    } else if (fileType === "videoPreview") {
      uploadsDir = join(
        process.cwd(),
        "public",
        "uploads",
        "courses",
        "videos"
      );
      finalFileName = `course-video-${decoded.id}-${Date.now()}.${metadata.fileName.split(".").pop()}`;
    } else {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    await mkdir(uploadsDir, { recursive: true });

    // Save final file
    const finalFilePath = join(uploadsDir, finalFileName);
    await writeFile(finalFilePath, finalFileBuffer);

    // Generate public URL
    const publicUrl = `/uploads/courses/${fileType === "thumbnail" ? "thumbnails" : "videos"}/${finalFileName}`;

    console.log(
      `📁 Finalize API: File combined successfully: ${finalFileName} (${(finalFileBuffer.length / (1024 * 1024)).toFixed(2)} MB)`
    );

    // Clean up temporary files
    try {
      const files = await readdir(tempDir);
      for (const file of files) {
        await unlink(join(tempDir, file));
      }
      await rmdir(tempDir);
      console.log(
        `📁 Finalize API: Temporary files cleaned up for session ${sessionId}`
      );
    } catch (error) {
      console.warn(
        `📁 Finalize API: Warning: Could not clean up temporary files:`,
        error
      );
    }

    return NextResponse.json({
      message: "File upload finalized successfully",
      fileUrl: publicUrl,
      fileName: finalFileName,
      fileSize: finalFileBuffer.length,
      sessionId,
    });
  } catch (error) {
    console.error("📁 Finalize API: Error finalizing upload:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, inténtalo de nuevo." },
      { status: 500 }
    );
  }
}

