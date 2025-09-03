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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string; messageId: string }> }
) {
  try {
    const { applicationId, messageId } = await params;
    console.log(
      "🔍 YouthApplicationMessages - Marking message as read:",
      messageId
    );

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

    // Check if message exists and belongs to this application
    const message = await prisma.youthApplicationMessage.findFirst({
      where: {
        id: messageId,
        applicationId: applicationId,
      },
      select: { id: true, senderId: true },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to mark this message as read
    // Users can only mark messages from others as read
    if (message.senderId === userId) {
      return NextResponse.json(
        { message: "Cannot mark own message as read" },
        { status: 400 }
      );
    }

    // Mark message as read
    await prisma.youthApplicationMessage.update({
      where: { id: messageId },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    console.log(
      "🔍 YouthApplicationMessages - Message marked as read successfully"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in youth application mark as read route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
