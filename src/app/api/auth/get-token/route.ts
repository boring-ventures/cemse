import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Helper function to decode token
function decodeToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔐 GET /api/auth/get-token - Extracting JWT token from cookies"
    );

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log(
        "🔐 GET /api/auth/get-token - No auth token found in cookies"
      );
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Handle different token types
    let decoded: any = null;
    let jwtToken: string | null = null;

    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token - use it directly
      decoded = decodeToken(token);
      jwtToken = token;
    } else if (token.startsWith("auth-token-")) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split("-");

      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        const tokenRole = tokenParts[2];

        // Create a JWT token for the user
        jwtToken = jwt.sign(
          {
            id: tokenUserId,
            role: tokenRole,
            username: `user_${tokenUserId}`,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
          },
          JWT_SECRET
        );

        decoded = {
          id: tokenUserId,
          role: tokenRole,
          username: `user_${tokenUserId}`,
        };
      }
    } else {
      // Try to decode as JWT
      decoded = decodeToken(token);
      jwtToken = token;
    }

    if (!decoded || !jwtToken) {
      console.log("🔐 GET /api/auth/get-token - Invalid token format");
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    console.log(
      "🔐 GET /api/auth/get-token - Successfully extracted token for user:",
      decoded.id
    );

    return NextResponse.json({
      token: jwtToken,
      user: {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
      },
    });
  } catch (error) {
    console.error("❌ Error in GET /api/auth/get-token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
