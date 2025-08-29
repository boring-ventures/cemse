import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Verifies a JWT token
 */
function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verifies a database token and fetches user data
 */
async function verifyDatabaseToken(token: string): Promise<AuthUser | null> {
  if (!token.startsWith("auth-token-")) {
    return null;
  }

  const tokenParts = token.split("-");
  if (tokenParts.length < 4) {
    return null;
  }

  const tokenUserId = tokenParts[3];

  try {
    const tokenUser = await prisma.user.findUnique({
      where: { id: tokenUserId, isActive: true },
    });

    if (tokenUser) {
      return {
        id: tokenUser.id,
        username: tokenUser.username,
        role: tokenUser.role,
      };
    }
  } catch (error) {
    console.error("Error verifying database token:", error);
  }

  return null;
}

/**
 * Authenticates a user from the request
 */
export async function authenticateUser(
  request?: NextRequest
): Promise<AuthUser> {
  let token: string | undefined;

  if (request) {
    // Extract token from request cookies
    token = request.cookies.get("cemse-auth-token")?.value;
  } else {
    // Fallback: try to get cookies dynamically (server component context)
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("cemse-auth-token")?.value;
    } catch (error) {
      throw new AuthenticationError("Authentication context not available");
    }
  }

  if (!token) {
    throw new AuthenticationError("No authentication token found");
  }

  let decoded: any = null;

  // Handle JWT tokens (contains dots and has 3 parts)
  if (token.includes(".") && token.split(".").length === 3) {
    decoded = verifyJWT(token);
  }
  // Handle database tokens (starts with auth-token-)
  else if (token.startsWith("auth-token-")) {
    const user = await verifyDatabaseToken(token);
    if (user) {
      decoded = user;
    }
  }
  // Fallback: try to verify as JWT
  else {
    decoded = verifyJWT(token);
  }

  if (!decoded) {
    throw new AuthenticationError("Invalid or expired token");
  }

  return {
    id: decoded.id,
    username: decoded.username || decoded.email || "unknown",
    role: decoded.role,
  };
}

/**
 * Gets user profile from database, creates one if it doesn't exist
 */
export async function getUserProfile(userId: string) {
  let profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  // If no profile exists, create a basic one automatically
  if (!profile) {
    console.log("🔍 Creating basic profile for user:", userId);
    try {
      // Get user data to use for profile creation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          role: true,
        },
      });

      if (!user) {
        throw new AuthenticationError("User not found", 404);
      }

      profile = await prisma.profile.create({
        data: {
          userId: userId,
          firstName: user.username || "Usuario",
          lastName: "",
          role: user.role, // Use the user's role from the User table
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      });
      console.log("🔍 Basic profile created for user:", profile.userId);
    } catch (createError) {
      console.error("🔍 Error creating profile:", createError);
      throw new AuthenticationError("Could not create user profile", 500);
    }
  }

  return profile;
}

/**
 * Middleware to handle authentication errors
 */
export function handleAuthError(error: unknown) {
  if (error instanceof AuthenticationError) {
    return {
      error: error.message,
      status: error.statusCode,
    };
  }

  console.error("Unexpected authentication error:", error);
  return {
    error: "Internal authentication error",
    status: 500,
  };
}
