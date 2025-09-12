import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    console.log(
      "🔍 Send Message API - verifyToken - Attempting to verify token"
    );

    // Handle mock development tokens
    if (token.startsWith("mock-dev-token-")) {
      console.log("🔍 Send Message API - Mock development token detected");
      const tokenParts = token.split("-");
      const userId =
        tokenParts.length >= 3
          ? tokenParts.slice(3, -1).join("-") || "mock-user"
          : "mock-user";
      const isCompanyToken =
        token.includes("mock-dev-token-company-") || userId.includes("company");

      return {
        id: userId,
        userId: userId,
        username: isCompanyToken ? `company_${userId}` : userId,
        role: isCompanyToken ? "EMPRESAS" : "SUPERADMIN",
        type: "mock",
        companyId: isCompanyToken ? userId : null,
      };
    }

    // For JWT tokens, use jwt.verify
    console.log("🔍 Send Message API - Attempting JWT verification");
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("🔍 Send Message API - JWT verified successfully");
    console.log("🔍 Send Message API - JWT decoded content:", {
      id: decoded.id,
      idType: typeof decoded.id,
      role: decoded.role,
      type: decoded.type,
      companyId: decoded.companyId,
      companyIdType: typeof decoded.companyId,
      username: decoded.username,
    });
    return decoded;
  } catch (error) {
    console.log(
      "🔍 Send Message API - Token verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log("🔍 POST Send Message API - Route called");
  try {
    console.log("🔍 POST Send Message API - Request headers:", {
      contentType: request.headers.get("content-type"),
      userAgent: request.headers.get("user-agent"),
      origin: request.headers.get("origin"),
    });
    const body = await request.json();
    const { applicationId, content, messageType = "TEXT" } = body;

    console.log(
      "🔍 POST Send Message API - Sending message for application:",
      applicationId
    );
    console.log("🔍 POST Send Message API - Message data:", {
      content,
      messageType,
    });

    if (!applicationId || !content) {
      return NextResponse.json(
        { error: "applicationId y content son requeridos" },
        { status: 400 }
      );
    }

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    console.log("🔍 Send Message API - Cookie info:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) || "none",
      allCookies: Array.from(cookieStore.getAll()).map((c) => ({
        name: c.name,
        hasValue: !!c.value,
      })),
    });

    if (!token) {
      console.log("🔍 Send Message API - No auth token found in cookies");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("🔍 Send Message API - Token verification failed");
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Additional validation for company users
    if (decoded.role === "EMPRESAS" && !decoded.id && !decoded.companyId) {
      console.log("🔍 Send Message API - Company user missing required fields");
      return NextResponse.json(
        { error: "Token de empresa inválido" },
        { status: 401 }
      );
    }

    console.log(
      "🔍 Send Message API - User authenticated:",
      decoded.username || decoded.id
    );
    console.log("🔍 Send Message API - Decoded token details:", {
      id: decoded.id,
      role: decoded.role,
      type: decoded.type,
      companyId: decoded.companyId,
      username: decoded.username,
    });

    // Check if application exists (simplified approach like youth application messages)
    console.log("🔍 Send Message API - Querying application:", applicationId);
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      select: { id: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    console.log("🔍 Send Message API - Application found:", {
      id: application.id,
    });

    // Determine sender type based on JWT token type and role
    // Use a more comprehensive approach to handle different user types
    console.log("🔍 Send Message API - JWT token details:", {
      id: decoded.id,
      role: decoded.role,
      type: decoded.type,
      companyId: decoded.companyId,
      username: decoded.username,
    });

    // Determine sender type based on JWT token information
    // Since we're in the company applications page, we know this is a company user
    let senderType: "COMPANY" | "APPLICANT";

    // DEBUG: Let's see what's actually in the JWT token
    console.log("🔍 Send Message API - FULL JWT token analysis:", {
      allFields: Object.keys(decoded),
      role: decoded.role,
      type: decoded.type,
      companyId: decoded.companyId,
      username: decoded.username,
      id: decoded.id,
      roleType: typeof decoded.role,
      typeType: typeof decoded.type,
      companyIdType: typeof decoded.companyId,
    });

    // Check if this is a company user based on JWT token fields
    if (
      decoded.role === "EMPRESAS" ||
      decoded.type === "COMPANY" ||
      decoded.companyId ||
      decoded.username?.includes("company") ||
      decoded.username?.includes("empresa")
    ) {
      senderType = "COMPANY";
      console.log("🔍 Send Message API - Company user detected:", {
        reason:
          decoded.role === "EMPRESAS"
            ? "role=EMPRESAS"
            : decoded.type === "COMPANY"
              ? "type=COMPANY"
              : decoded.companyId
                ? "hasCompanyId"
                : "username pattern",
        senderType,
        jwtDetails: {
          role: decoded.role,
          type: decoded.type,
          companyId: decoded.companyId,
          username: decoded.username,
        },
      });
    } else {
      // This is a youth/applicant user
      senderType = "APPLICANT";
      console.log("🔍 Send Message API - Applicant user detected:", {
        reason: "not a company user - defaulting to APPLICANT",
        senderType,
        jwtDetails: {
          role: decoded.role,
          type: decoded.type,
          companyId: decoded.companyId,
          username: decoded.username,
        },
        conditions: {
          roleIsEMPRESAS: decoded.role === "EMPRESAS",
          typeIsCOMPANY: decoded.type === "COMPANY",
          hasCompanyId: !!decoded.companyId,
          usernameHasCompany: decoded.username?.includes("company"),
          usernameHasEmpresa: decoded.username?.includes("empresa"),
        },
      });
    }

    console.log("🔍 Send Message API - Creating message with:", {
      applicationId,
      senderId: decoded.id,
      senderType: senderType,
      content: content.substring(0, 50) + "...",
      messageType,
    });

    // Create message in database
    console.log("🔍 Send Message API - About to create message with data:", {
      applicationId,
      content: content.substring(0, 50) + "...",
      messageType,
      senderId: decoded.id,
      senderType: senderType,
      status: "SENT",
    });

    const newMessage = await prisma.jobApplicationMessage.create({
      data: {
        applicationId,
        content,
        messageType,
        senderId: decoded.id,
        senderType: senderType,
        status: "SENT",
      },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            jobOffer: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    website: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("🔍 Send Message API - Message created successfully:", {
      id: newMessage.id,
      senderType: newMessage.senderType,
      senderId: newMessage.senderId,
      content: newMessage.content.substring(0, 50) + "...",
    });

    console.log(
      "✅ Send Message API - Successfully created message:",
      newMessage.id
    );
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("❌ Send Message API - Error sending message:", error);
    return NextResponse.json(
      { error: "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}
