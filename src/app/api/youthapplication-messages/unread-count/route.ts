import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Function to decode JWT token from cookies (consistent with other endpoints)
function decodeToken(token: string) {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return null;
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 YouthApplicationMessages - Getting unread count");

    // Get token from cookies (cookie-based authentication)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log(
        "🔍 YouthApplicationMessages - No auth token found in cookies"
      );
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    // Decode token to get user info
    let userId: string;

    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token
      console.log("🔍 YouthApplicationMessages - JWT token detected");
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.id;
        console.log(
          "🔍 YouthApplicationMessages - Authenticated user ID:",
          userId
        );
      } catch (error) {
        console.error(
          "🔍 YouthApplicationMessages - JWT verification failed:",
          error
        );
        return NextResponse.json(
          { message: "Invalid authentication token" },
          { status: 401 }
        );
      }
    } else {
      // Simple token format
      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        console.log("🔍 YouthApplicationMessages - Invalid token format");
        return NextResponse.json(
          { message: "Invalid authentication token" },
          { status: 401 }
        );
      }
      userId = decoded.id;
      console.log(
        "🔍 YouthApplicationMessages - Authenticated user ID:",
        userId
      );
    }

    // Get user profile to determine sender type
    const userProfile = await prisma.profile.findUnique({
      where: { userId: userId },
      select: { role: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }

    // Determine sender type based on user role
    const senderType = userProfile.role === "COMPANIES" ? "COMPANY" : "YOUTH";

    // Count unread messages for this user
    const unreadCount = await prisma.youthApplicationMessage.count({
      where: {
        senderType: { not: senderType }, // Messages from other users
        status: { not: "READ" },
        youthApplication: {
          // For companies: show unread messages from youth applications they posted
          // For youth: show unread messages from their applications
          ...(userProfile.role === "COMPANIES"
            ? { companyId: userId }
            : { youthId: userId }),
        },
      },
    });

    console.log("🔍 YouthApplicationMessages - Unread count:", unreadCount);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error in youth application unread count route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
