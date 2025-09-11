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

    console.log("🔍 Debug CV save for user:", decoded.id);

    // Get the request body
    const body = await request.json();
    console.log("📥 Debug - Received data:", JSON.stringify(body, null, 2));

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id },
    });

    if (!existingProfile) {
      console.log("❌ Profile not found for user:", decoded.id);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("✅ Profile found:", existingProfile.id);

    // Test minimal update
    const testData = {
      firstName: "Test",
      lastName: "User",
    };

    console.log("💾 Testing minimal update with:", testData);

    const result = await prisma.profile.update({
      where: { userId: decoded.id },
      data: testData,
    });

    console.log("✅ Minimal update successful:", result.id);

    return NextResponse.json({
      message: "Debug test successful",
      profileId: result.id,
    });
  } catch (error) {
    console.error("❌ Debug test error:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json(
      { error: "Debug test failed", details: error.message },
      { status: 500 }
    );
  }
}

