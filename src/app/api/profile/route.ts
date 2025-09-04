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
    console.log("👤 /api/profile PUT - Request body:", body);

    // Validate and filter the data to only include valid profile fields that exist in the database
    const validFields = [
      // Basic information
      "firstName", // maps to first_name
      "lastName", // maps to last_name
      "email",
      "phone",
      "address",
      "municipality",
      "department",
      "country",
      "birthDate", // maps to birth_date
      "gender",

      // Document information
      "documentType", // maps to document_type
      "documentNumber", // maps to document_number

      // Education information
      "educationLevel", // maps to education_level
      "currentInstitution", // maps to current_institution
      "graduationYear", // maps to graduation_year
      "isStudying", // maps to is_studying
      "currentDegree", // maps to current_degree
      "universityName", // maps to university_name
      "universityStartDate", // maps to university_start_date
      "universityEndDate", // maps to university_end_date
      "universityStatus", // maps to university_status
      "gpa",

      // Skills and interests
      "skills",
      "interests",

      // Work experience
      "workExperience", // maps to work_experience
      "jobTitle", // maps to job_title
      "addressLine", // maps to address_line
      "cityState", // maps to city_state

      // Company/Institution information (for different user types)
      "companyName", // maps to company_name
      "businessSector", // maps to business_sector
      "companySize", // maps to company_size
      "companyDescription", // maps to company_description
      "website",
      "foundedYear", // maps to founded_year
      "institutionName", // maps to institution_name
      "institutionType", // maps to institution_type
      "serviceArea", // maps to service_area
      "specialization",
      "institutionDescription", // maps to institution_description

      // Additional fields
      "languages",
      "websites",
      "skillsWithLevel", // maps to skills_with_level
      "extracurricularActivities", // maps to extracurricular_activities
      "projects",
      "achievements",
    ];

    const filteredData = Object.keys(body)
      .filter((key) => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as any);

    console.log("👤 /api/profile PUT - Filtered data:", filteredData);

    // Check if we have any data to update
    if (Object.keys(filteredData).length === 0) {
      console.log("👤 /api/profile PUT - No valid data to update");
      return NextResponse.json({
        message: "No valid data to update",
        profile: null,
      });
    }

    // First, check if the profile exists
    try {
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: decoded.id },
      });

      if (!existingProfile) {
        console.log(
          "👤 /api/profile PUT - Profile not found for user:",
          decoded.id
        );
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      console.log(
        "👤 /api/profile PUT - Found existing profile:",
        existingProfile.id
      );
    } catch (findError) {
      console.error("👤 /api/profile PUT - Error finding profile:", findError);
      throw findError;
    }

    try {
      // Try a simple update first with just one field to test
      console.log(
        "👤 /api/profile PUT - Attempting update with data:",
        filteredData
      );

      const updatedProfile = await prisma.profile.update({
        where: { userId: decoded.id },
        data: filteredData,
      });

      console.log(
        "👤 /api/profile PUT - Profile updated successfully:",
        updatedProfile.id
      );
      return NextResponse.json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (dbError) {
      console.error("👤 /api/profile PUT - Database error:", dbError);
      console.error("👤 /api/profile PUT - Database error details:", {
        message:
          dbError instanceof Error ? dbError.message : "Unknown database error",
        stack: dbError instanceof Error ? dbError.stack : undefined,
        code: (dbError as any)?.code,
        meta: (dbError as any)?.meta,
      });

      // Try to provide more specific error information
      if ((dbError as any)?.code === "P2002") {
        return NextResponse.json(
          { error: "A record with this data already exists" },
          { status: 400 }
        );
      } else if ((dbError as any)?.code === "P2025") {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      throw dbError;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
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
