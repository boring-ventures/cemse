import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir, existsSync } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

// Configure runtime for chunk uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes timeout
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Configure body size limit for chunk uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "512kb", // 512KB per chunk (with some buffer)
    },
  },
};

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// POST /api/files/upload/chunk - Upload a single chunk of a file
export async function POST(request: NextRequest) {
  try {
    console.log("📁 Chunk API: Chunk upload request received");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("📁 Chunk API: No auth token found in cookies");
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
      console.log("📁 Chunk API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File;
    const chunkNumber = parseInt(formData.get("chunkNumber") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const sessionId = formData.get("sessionId") as string;
    const fileName = formData.get("fileName") as string;
    const fileType = formData.get("fileType") as string;
    const fileSize = parseInt(formData.get("fileSize") as string);
    const mimeType = formData.get("mimeType") as string;

    // Validate required fields
    if (
      !chunk ||
      !chunkNumber ||
      !totalChunks ||
      !sessionId ||
      !fileName ||
      !fileType ||
      !mimeType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate chunk size (max 256KB per chunk, but allow smaller chunks)
    if (chunk.size > 256 * 1024) {
      return NextResponse.json(
        { error: "Chunk size too large. Maximum 256KB per chunk" },
        { status: 400 }
      );
    }

    console.log(
      `📁 Chunk API: Processing chunk ${chunkNumber}/${totalChunks} for ${fileName} (${(chunk.size / 1024).toFixed(0)} KB)`
    );

    // Create temporary directory for chunks
    const tempDir = join(process.cwd(), "temp", "chunks", sessionId);
    await mkdir(tempDir, { recursive: true });

    // Save chunk to temporary file
    const chunkFileName = `chunk-${chunkNumber.toString().padStart(3, "0")}`;
    const chunkPath = join(tempDir, chunkFileName);

    const bytes = await chunk.arrayBuffer();
    await writeFile(chunkPath, new Uint8Array(bytes));

    // Save metadata
    const metadataPath = join(tempDir, "metadata.json");
    const metadata = {
      fileName,
      fileType,
      fileSize,
      mimeType,
      totalChunks,
      uploadedChunks: [chunkNumber],
      sessionId,
      userId: decoded.id,
      timestamp: Date.now(),
    };

    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(
      `📁 Chunk API: Chunk ${chunkNumber}/${totalChunks} saved successfully`
    );

    return NextResponse.json({
      message: `Chunk ${chunkNumber}/${totalChunks} uploaded successfully`,
      chunkNumber,
      totalChunks,
      sessionId,
    });
  } catch (error) {
    console.error("📁 Chunk API: Error processing chunk:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
