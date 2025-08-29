import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Function to decode JWT token (same as in auth/me)
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

// GET /api/profile - Get profiles with optional role filtering
export async function GET(request: NextRequest) {
  try {
    console.log("👤 /api/profile - Profile request received");

    // Get token from cookies (consistent with auth/me)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("👤 /api/profile - No auth token found in cookies");
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Decode token to check expiration and get user info
    const decoded = decodeToken(token);
    if (!decoded) {
      console.log("👤 /api/profile - Invalid token format");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp * 1000) {
      console.log("👤 /api/profile - Token expired");
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    console.log("👤 /api/profile - Fetching profiles with role:", role);

    // Build query based on parameters
    if (role) {
      // First find users with the specified role
      const users = await prisma.user.findMany({
        where: {
          role: role as any,
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
        },
      });

      // Get user IDs to find their profiles
      const userIds = users.map((user) => user.id);

      // Find profiles for these users
      const profiles = await prisma.profile.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });

      // Combine profile data with user data
      const profilesWithUsers = profiles.map((profile) => {
        const user = users.find((u) => u.id === profile.userId);
        return {
          ...profile,
          user: user,
        };
      });

      console.log(
        "👤 /api/profile - Found profiles with role",
        role,
        ":",
        profilesWithUsers.length
      );
      return NextResponse.json(profilesWithUsers);
    } else {
      // Get current user's profile if no role specified
      let profile = await prisma.profile.findUnique({
        where: { userId: decoded.id },
      });

      // If no profile exists, create a basic one automatically
      if (!profile) {
        console.log("🔍 Creating basic profile for user:", decoded.id);
        try {
          profile = await prisma.profile.create({
            data: {
              userId: decoded.id,
              firstName: decoded.username || "Usuario",
              lastName: "",
              role: "YOUTH", // Default role
            },
          });
          console.log("🔍 Basic profile created for API:", profile.id);
        } catch (createError) {
          console.error("🔍 Error creating profile:", createError);
          return NextResponse.json(
            { error: "Could not create user profile" },
            { status: 500 }
          );
        }
      }

      // Get user data separately
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
        },
      });

      const profileWithUser = {
        ...profile,
        user: user,
      };

      console.log("👤 /api/profile - Found user profile:", profile.id);
      return NextResponse.json(profileWithUser);
    }
  } catch (error) {
    console.error("Error in /api/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    console.log("👤 /api/profile PUT - Profile update request received");

    // Get token from cookies (consistent with auth/me)
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("👤 /api/profile PUT - No auth token found in cookies");
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Decode token to check expiration and get user info
    const decoded = decodeToken(token);
    if (!decoded) {
      console.log("👤 /api/profile PUT - Invalid token format");
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp * 1000) {
      console.log("👤 /api/profile PUT - Token expired");
      return NextResponse.json(
        { error: "Authentication token expired" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updatedProfile = await prisma.profile.update({
      where: { userId: decoded.id },
      data: body,
    });

    console.log("👤 /api/profile PUT - Profile updated:", updatedProfile.id);
    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create profile data in database
export async function POST(request: NextRequest) {
  try {
    console.log("👤 /api/profile POST - Profile creation request received");

    const data = await request.json();
    const { userId, firstName, lastName, avatarUrl, birthDate } = data;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      console.log(
        "👤 /api/profile POST - Profile already exists for user:",
        userId
      );
      return NextResponse.json(existingProfile, { status: 200 });
    }

    // Create new profile
    const newProfile = await prisma.profile.create({
      data: {
        userId,
        firstName: firstName || user.username || "Usuario",
        lastName: lastName || "",
        avatarUrl: avatarUrl || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        role: user.role, // Use the user's role from the User table
        active: true,
      },
    });

    console.log(
      "👤 /api/profile POST - Profile created successfully:",
      newProfile.id
    );
    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
