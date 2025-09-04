import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🏛️ GET /api/municipality/auth/me - Starting request");

    // Get token from cookies (consistent with other auth endpoints)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log(
        "❌ GET /api/municipality/auth/me - No auth token found in cookies"
      );
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Decode token to check expiration and get user info
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("❌ GET /api/municipality/auth/me - Invalid token format");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp * 1000) {
      console.log("❌ GET /api/municipality/auth/me - Token expired");
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    console.log(
      "🏛️ GET /api/municipality/auth/me - Token verified, user ID:",
      decoded.id
    );

    // Get the user and check if they are a municipality user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.log("❌ GET /api/municipality/auth/me - User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MUNICIPAL_GOVERNMENTS") {
      console.log(
        "❌ GET /api/municipality/auth/me - User is not a municipality user"
      );
      return NextResponse.json(
        { error: "Not authorized as municipality user" },
        { status: 403 }
      );
    }

    // Get profile information
    let profile = null;
    try {
      profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
    } catch (error) {
      console.log("No profile found for municipality user:", user.id);
    }

    // For municipal government users, we'll create/return mock municipality data
    // In a real scenario, you'd have a Municipality table linked to the user
    const municipalityData = {
      municipality: {
        id: "mock-municipality-" + user.id,
        name: profile?.municipality || "Municipio de " + user.username,
        department: profile?.department || "Cochabamba",
        description:
          "Gobierno Municipal comprometido con el desarrollo de la comunidad",
        address: profile?.address || "Dirección municipal",
        phone: profile?.phone || "+591-4-1234567",
        email: profile?.email || user.username + "@municipio.gov.bo",
        website: "www." + user.username + ".municipio.gov.bo",
        mayor:
          profile?.firstName && profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : "Alcalde Municipal",
        population: 50000,
        area: 150.5,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
      },
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        email: profile?.email || "",
        phone: profile?.phone || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    console.log(
      "✅ GET /api/municipality/auth/me - Returning municipality data for:",
      user.username
    );
    return NextResponse.json(municipalityData);
  } catch (error) {
    console.error("❌ GET /api/municipality/auth/me - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
