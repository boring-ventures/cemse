import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET /api/admin/users - Get all users with profiles
export async function GET(request: NextRequest) {
  try {
    console.log("👥 /api/admin/users - Get users request received");

    // Temporarily remove authentication for testing
    // TODO: Re-enable authentication after testing

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    console.log("👥 /api/admin/users - Fetching users with filters:", {
      role,
      search,
    });

    // Build query based on parameters
    let whereClause: any = {
      isActive: true,
    };

    if (role && role !== "all") {
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { profile: { firstName: { contains: search, mode: "insensitive" } } },
        { profile: { lastName: { contains: search, mode: "insensitive" } } },
        { profile: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get users with their profiles
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("👥 /api/admin/users - Found users:", users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in /api/admin/users GET:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user with profile
export async function POST(request: NextRequest) {
  try {
    console.log("👥 /api/admin/users - Create user request received");

    // Temporarily remove authentication for testing
    // TODO: Re-enable authentication after testing

    const body = await request.json();
    const {
      username,
      password,
      role,
      firstName,
      lastName,
      email,
      phone,
      address,
      municipality,
      department,
      country,
      birthDate,
      gender,
      educationLevel,
      currentInstitution,
      graduationYear,
      isStudying,
      skills,
      interests,
      status,
    } = body;

    // Validate required fields
    if (!username || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        {
          error:
            "Username, password, role, firstName, and lastName are required",
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = [
      "YOUTH",
      "ADOLESCENTS",
      "COMPANIES",
      "MUNICIPAL_GOVERNMENTS",
      "TRAINING_CENTERS",
      "NGOS_AND_FOUNDATIONS",
      "INSTRUCTOR",
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: " + validRoles.join(", ") },
        { status: 400 }
      );
    }

    // Use transaction to ensure both user and profile are created
    const result = await prisma.$transaction(async (tx) => {
      // Check if username already exists
      const existingUser = await tx.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        throw new Error(
          `Username '${username}' is already taken. Please choose a different username.`
        );
      }

      // Check if email already exists in profiles
      if (email) {
        const existingProfile = await tx.profile.findFirst({
          where: { email },
        });

        if (existingProfile) {
          throw new Error(
            `Email '${email}' is already registered. Please use a different email.`
          );
        }
      }

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create User record for authentication
      console.log("🔐 Creating User record for authentication");
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role as any,
          isActive: true,
        },
      });
      console.log("✅ User created with ID:", user.id);

      // Create Profile record
      console.log("👤 Creating Profile record");
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          address: address || null,
          municipality: municipality || null,
          department: department || "Cochabamba",
          country: country || "Bolivia",
          birthDate: birthDate ? new Date(birthDate) : null,
          gender: gender || null,
          educationLevel: educationLevel || null,
          currentInstitution: currentInstitution || null,
          graduationYear: graduationYear || null,
          isStudying: isStudying || false,
          skills: skills || [],
          interests: interests || [],
          role: role as any,
          status: status || "ACTIVE",
          active: true,
          profileCompletion: 0,
        },
      });
      console.log("✅ Profile created with ID:", profile.id);

      return { user, profile };
    });

    console.log("👥 User and profile created successfully");
    return NextResponse.json(
      {
        message: "User created successfully",
        user: result.user,
        profile: result.profile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    );
  }
}
