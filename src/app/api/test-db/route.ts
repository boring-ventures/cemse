import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing database connection...");

    // Test basic database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("🧪 Database connection test result:", result);

    // Test profile table access
    const profileCount = await prisma.profile.count();
    console.log("🧪 Profile table count:", profileCount);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      profileCount,
    });
  } catch (error) {
    console.error("🧪 Database test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
