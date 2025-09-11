import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🏢 API: Company logo upload request received");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("🏢 API: No auth token found in cookies");
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
          "🏢 API: Database token validated for user:",
          decoded.username
        );
      }
    } else {
      decoded = verifyToken(token);
    }

    if (!decoded) {
      console.log("🏢 API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log("🏢 API: Authenticated user:", decoded.username || decoded.id);

    const formData = await request.formData();
    const file = formData.get("logo") as File;

    console.log("🏢 API: Form data received:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    if (!file) {
      console.log("🏢 API: No file found in form data");
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "companies");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `logo-${decoded.id}-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, new Uint8Array(bytes));

    const logoUrl = `/uploads/companies/${filename}`;

    console.log("🏢 API: Logo uploaded successfully:", logoUrl);

    // Find the company associated with this user
    let company = await prisma.company.findFirst({
      where: { createdBy: decoded.id },
    });

    // If not found, try to find by username/loginEmail (for admin-created companies)
    if (!company) {
      console.log(
        "🏢 API: Company not found by createdBy, trying by username/loginEmail"
      );
      company = await prisma.company.findFirst({
        where: {
          OR: [
            { username: decoded.username },
            { loginEmail: `${decoded.username}@cemse.dev` },
          ],
        },
      });
    }

    if (company) {
      // Update company with new logo URL
      try {
        await prisma.company.update({
          where: { id: company.id },
          data: {
            logoUrl: logoUrl,
          },
        });
        console.log("🏢 API: Company updated successfully in database");
      } catch (dbError) {
        console.error("🏢 API: Database update failed:", dbError);
        throw dbError;
      }
    } else {
      console.log(
        "🏢 API: No company found for user, but logo uploaded successfully"
      );
    }

    return NextResponse.json({
      logoUrl,
      filename,
      message: "Logo uploaded successfully",
    });
  } catch (error) {
    console.error("🏢 API: Company logo upload error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
