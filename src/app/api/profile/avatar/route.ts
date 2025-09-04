import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Function to decode JWT token (same as in profile route)
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

// DELETE /api/profile/avatar - Eliminar imagen de perfil
export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ API: Profile avatar deletion request received");

    // Get token from cookies (consistent with other profile APIs)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("🗑️ API: No auth token found in cookies");
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Decode token to check expiration and get user info
    const decoded = decodeToken(token);
    if (!decoded) {
      console.log("🗑️ API: Invalid token format");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp * 1000) {
      console.log("🗑️ API: Token expired");
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    // Update profile to remove avatar URL
    const updatedProfile = await prisma.profile.update({
      where: { userId: decoded.id },
      data: {
        avatarUrl: null,
      },
    });

    console.log(
      "🗑️ API: Profile avatar deleted successfully for user:",
      decoded.id
    );

    return NextResponse.json({
      message: "Imagen de perfil eliminada exitosamente",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error al eliminar imagen de perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
