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

// GET: Obtener resumen de conversaciones con empresas para una postulación específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 API: Received request for chat summary:", id);

    // Temporary test to see if API is being called
    // return NextResponse.json({ test: "API is working", applicationId: id });

    // Get token from cookies (cookie-based authentication)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("🔍 API: No auth token found in cookies");
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    // Decode token to get user info
    let userId: string;

    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token
      console.log("🔍 API: JWT token detected");
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.id;
        console.log("🔍 API: Authenticated user ID:", userId);
      } catch (error) {
        console.error("🔍 API: JWT verification failed:", error);
        return NextResponse.json(
          { message: "Invalid authentication token" },
          { status: 401 }
        );
      }
    } else {
      // Simple token format
      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        console.log("🔍 API: Invalid token format");
        return NextResponse.json(
          { message: "Invalid authentication token" },
          { status: 401 }
        );
      }
      userId = decoded.id;
      console.log("🔍 API: Authenticated user ID:", userId);
    }

    // Check if youth application exists and user has permission
    const youthApplication = await prisma.youthApplication.findUnique({
      where: { id },
      select: {
        id: true,
        youthProfileId: true,
        title: true,
      },
    });

    if (!youthApplication) {
      return NextResponse.json(
        { message: "Youth application not found" },
        { status: 404 }
      );
    }

    // Only allow the creator to view chat summary
    if (youthApplication.youthProfileId !== userId) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 403 }
      );
    }

    // Get ALL messages for this youth application
    console.log("🔍 API: Querying ALL messages for applicationId:", id);

    const messages = await prisma.youthApplicationMessage.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
    });

    console.log("🔍 API: Found messages:", messages.length);
    console.log("🔍 API: All messages data:", messages);

    // Filter to only show company messages (not youth messages)
    const companyMessages = messages.filter(
      (message) => message.senderType === "COMPANY"
    );
    console.log("🔍 API: Company messages found:", companyMessages.length);

    // Group company messages by unique senderId and get the latest message from each company
    const uniqueSenders = new Map();

    companyMessages.forEach((message) => {
      const senderId = message.senderId;
      if (
        !uniqueSenders.has(senderId) ||
        new Date(message.createdAt) >
          new Date(uniqueSenders.get(senderId).createdAt)
      ) {
        uniqueSenders.set(senderId, message);
      }
    });

    // Convert to array and format for display
    const uniqueChats = Array.from(uniqueSenders.values()).map((message) => ({
      id: message.id,
      applicationId: message.applicationId,
      senderId: message.senderId,
      senderType: message.senderType,
      content: message.content,
      createdAt: message.createdAt,
      readAt: message.readAt,
      // Add sender name if it's a company
      senderName:
        message.senderType === "COMPANY"
          ? `Company ${message.senderId}`
          : "You",
    }));

    console.log("🔍 API: Unique senders found:", uniqueSenders.size);
    console.log("🔍 API: Unique chats data:", uniqueChats);

    return NextResponse.json({
      summaries: uniqueChats, // Return unique senders with latest messages
      application: {
        id: youthApplication.id,
        title: youthApplication.title,
      },
    });
  } catch (error) {
    console.error("Error in get chat summary route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
