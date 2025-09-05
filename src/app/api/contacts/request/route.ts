import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Contacts Request API called"); // Debug

    // Test database connectivity
    try {
      await prisma.$connect();
      console.log("🔍 API: Database connected successfully");

      // Test Profile table access
      const profileCount = await prisma.profile.count();
      console.log("🔍 API: Profile table accessible, count:", profileCount);
    } catch (dbError) {
      console.error("🔍 API: Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("🔍 API: Authenticated user:", decoded.username);
    console.log("🔍 API: Decoded token:", decoded);

    const body = await request.json();
    console.log("🔍 Contacts Request API - Request body:", body);

    const { contactId, requestMessage } = body;
    console.log(
      "🔍 API: Extracted contactId:",
      contactId,
      "requestMessage:",
      requestMessage
    );

    // Validate required fields
    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Check if user is trying to add themselves
    if (decoded.id === contactId) {
      return NextResponse.json(
        { error: "Cannot send contact request to yourself" },
        { status: 400 }
      );
    }

    // Check if both users exist in the Profile table
    console.log("🔍 API: Checking if users exist in Profile table");
    const [senderProfile, receiverProfile] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: decoded.id } }),
      prisma.profile.findUnique({ where: { userId: contactId } }),
    ]);

    console.log(
      "🔍 API: Sender profile:",
      senderProfile ? "exists" : "not found"
    );
    console.log(
      "🔍 API: Receiver profile:",
      receiverProfile ? "exists" : "not found"
    );

    if (!senderProfile) {
      return NextResponse.json(
        { error: "Sender profile not found" },
        { status: 404 }
      );
    }

    if (!receiverProfile) {
      return NextResponse.json(
        { error: "Receiver profile not found" },
        { status: 404 }
      );
    }

    // Check if contact request already exists
    console.log(
      "🔍 API: Checking for existing contact between:",
      decoded.id,
      "and",
      contactId
    );
    const existingContact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: decoded.id, contactId: contactId },
          { userId: contactId, contactId: decoded.id },
        ],
      },
    });

    console.log("🔍 API: Existing contact found:", existingContact);

    if (existingContact) {
      return NextResponse.json(
        { error: "Contact request already exists" },
        { status: 409 }
      );
    }

    // Create contact request
    console.log("🔍 API: Creating contact request with data:", {
      userId: decoded.id,
      contactId: contactId,
      status: "PENDING",
      requestMessage: requestMessage || null,
    });

    const contactRequest = await prisma.contact.create({
      data: {
        userId: decoded.id,
        contactId: contactId,
        status: "PENDING",
        requestMessage: requestMessage || null,
      },
      include: {
        contact: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    console.log("🔍 API: Contact request created:", contactRequest.id);
    return NextResponse.json(contactRequest, { status: 201 });
  } catch (error) {
    console.error("🔍 Contacts Request API - Error:", error);
    console.error("🔍 Contacts Request API - Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: "Error creating contact request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
