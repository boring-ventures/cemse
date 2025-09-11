import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing simple database update...");

    // Get JWT token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    console.log("🔍 User ID:", userId);

    // Try to find the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    console.log("👤 Profile found:", profile ? "Yes" : "No");

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Try a simple update with just firstName
    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: {
        firstName: "Test Update",
      },
    });

    console.log("✅ Simple update successful");

    return NextResponse.json({
      success: true,
      message: "Simple update worked",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("❌ Simple test error:", error);
    console.error(
      "❌ Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

    return NextResponse.json(
      {
        error: "Simple test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

