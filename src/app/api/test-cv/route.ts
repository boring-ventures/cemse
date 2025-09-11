import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    console.log("🔍 Testing CV save for user:", decoded.id);

    // Test minimal update with only new fields
    const testData = {
      targetPosition: "Test Position",
      targetCompany: "Test Company",
      relevantSkills: ["JavaScript", "TypeScript"],
      professionalSummary: "Test professional summary",
    };

    console.log("💾 Testing save with data:", testData);

    const updatedProfile = await prisma.profile.update({
      where: { userId: decoded.id },
      data: testData,
    });

    console.log("✅ Test save successful:", updatedProfile.id);

    return NextResponse.json({
      message: "Test save successful",
      profileId: updatedProfile.id,
    });
  } catch (error) {
    console.error("❌ Test save error:", error);
    return NextResponse.json(
      { error: "Test save failed", details: error.message },
      { status: 500 }
    );
  }
}

