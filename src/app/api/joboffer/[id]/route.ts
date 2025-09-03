import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(token: string) {
  try {
    // Handle mock development tokens
    if (token.startsWith("mock-dev-token-")) {
      const parts = token.split("-");
      if (parts.length >= 4) {
        const username = parts.slice(3, -1).join("-");
        return {
          id: username,
          username: username,
          role: "EMPRESAS",
          type: "mock",
        };
      }
    }

    // Try multiple possible JWT secrets (for debugging)
    const possibleSecrets = [
      JWT_SECRET,
      "supersecretkey",
      process.env.JWT_SECRET,
      "your-secret-key",
      "cemse-secret",
    ].filter(Boolean);

    for (const secret of possibleSecrets) {
      try {
        console.log("🔍 Trying JWT secret:", secret?.substring(0, 10) + "...");
        const decoded = jwt.verify(token, secret as string) as any;
        console.log(
          "✅ JWT verified successfully with secret:",
          secret?.substring(0, 10) + "..."
        );
        return decoded;
      } catch (secretError) {
        console.log(
          "❌ Failed with secret:",
          secret?.substring(0, 10) + "...",
          secretError instanceof Error ? secretError.message : "Unknown"
        );
        continue;
      }
    }

    throw new Error("No valid JWT secret found");
  } catch (error) {
    console.log(
      "Token verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: jobOfferId } = params;
    console.log("📋 /api/joboffer/[id] GET - Fetching job offer:", jobOfferId);

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("❌ No auth token found in cookies");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the job offer exists
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!jobOffer) {
      console.log("❌ Job offer not found:", jobOfferId);
      return NextResponse.json(
        { error: "Job offer not found" },
        { status: 404 }
      );
    }

    console.log("✅ Job offer fetched successfully:", jobOffer.id);
    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error("❌ Error fetching job offer:", error);
    return NextResponse.json(
      { error: "Error al cargar la oferta de trabajo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: jobOfferId } = params;
    console.log(
      "🗑️ /api/joboffer/[id] DELETE - Deleting job offer:",
      jobOfferId
    );

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    console.log(
      "🗑️ /api/joboffer/[id] DELETE - Auth token found:",
      token ? "YES" : "NO"
    );

    if (!token) {
      console.log("❌ No auth token found in cookies");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token
      console.log("🗑️ /api/joboffer/[id] DELETE - JWT token found in cookies");
      decoded = verifyToken(token);
    } else if (token.startsWith("auth-token-")) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      console.log(
        "🗑️ /api/joboffer/[id] DELETE - Database token found in cookies"
      );
      const tokenParts = token.split("-");

      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];

        // Verify the user exists and is active
        const tokenUser = await prisma.user.findUnique({
          where: { id: tokenUserId, isActive: true },
        });

        if (tokenUser) {
          decoded = {
            id: tokenUser.id,
            username: tokenUser.username,
            role: tokenUser.role,
          };
          console.log(
            "🗑️ /api/joboffer/[id] DELETE - Database token validated for user:",
            tokenUser.username
          );
        }
      }
    } else {
      // Try to verify as JWT token anyway
      decoded = verifyToken(token);
    }

    if (!decoded) {
      console.log("❌ Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is a company
    if (decoded.role !== "COMPANIES") {
      console.log("❌ User is not a company:", decoded.role);
      return NextResponse.json(
        { error: "Solo las empresas pueden eliminar ofertas de trabajo" },
        { status: 403 }
      );
    }

    if (!jobOfferId) {
      console.log("❌ No job offer ID provided");
      return NextResponse.json(
        { error: "ID de oferta de trabajo no proporcionado" },
        { status: 400 }
      );
    }

    console.log("🗑️ /api/joboffer/[id] DELETE - Job offer ID:", jobOfferId);

    // Check if job offer exists and belongs to the company
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!jobOffer) {
      console.log("❌ Job offer not found:", jobOfferId);
      return NextResponse.json(
        { error: "Oferta de trabajo no encontrada" },
        { status: 404 }
      );
    }

    // Check if the job offer belongs to the company user
    if (jobOffer.companyId !== decoded.id) {
      console.log("❌ Job offer does not belong to company:", {
        jobOfferCompanyId: jobOffer.companyId,
        userCompanyId: decoded.id,
      });
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta oferta de trabajo" },
        { status: 403 }
      );
    }

    console.log("🗑️ /api/joboffer/[id] DELETE - Job offer found:", {
      id: jobOffer.id,
      title: jobOffer.title,
      companyId: jobOffer.companyId,
    });

    // Delete the job offer
    await prisma.jobOffer.delete({
      where: { id: jobOfferId },
    });

    console.log("✅ Job offer deleted successfully:", jobOfferId);

    return NextResponse.json(
      { message: "Oferta de trabajo eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting job offer:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });

    return NextResponse.json(
      {
        error: "Error interno del servidor al eliminar la oferta de trabajo",
        debug: {
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
