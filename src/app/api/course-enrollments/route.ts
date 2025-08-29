import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Simple test endpoint
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log("📚 API: Received request for course enrollments");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("📚 API: No auth token found in cookies");
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token
      console.log("📚 API: JWT token found in cookies");
      decoded = verifyToken(token);
    } else if (token.startsWith("auth-token-")) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      console.log("📚 API: Database token found in cookies");
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
            "📚 API: Database token validated for user:",
            tokenUser.username
          );
        }
      }
    } else {
      // Try to verify as JWT token anyway
      decoded = verifyToken(token);
    }

    if (!decoded) {
      console.log("📚 API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log("📚 API: Authenticated user:", decoded.username || decoded.id);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    // Build filter conditions
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;

    // If no specific filters, get enrollments for the authenticated user
    if (!courseId && !studentId) {
      // Get user's profile to use the correct studentId
      const userProfile = await prisma.profile.findUnique({
        where: { userId: decoded.id },
      });

      if (userProfile) {
        where.studentId = userProfile.userId;
      } else {
        // If no profile found, return empty enrollments
        return NextResponse.json({ enrollments: [] });
      }
    }

    // Get course enrollments from database
    const enrollments = await prisma.courseEnrollment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            category: true,
            isActive: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Return actual enrollments from database

    console.log("📚 API: Found", enrollments.length, "course enrollments");
    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("Error in course enrollments route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📚 API: Received request to create course enrollment");
    console.log("📚 API: POST route is working!");

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("cemse-auth-token")?.value;

    if (!token) {
      console.log("📚 API: No auth token found in cookies");
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes(".") && token.split(".").length === 3) {
      // JWT token
      console.log("📚 API: JWT token found in cookies");
      decoded = verifyToken(token);
    } else if (token.startsWith("auth-token-")) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      console.log("📚 API: Database token found in cookies");
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
            "📚 API: Database token validated for user:",
            tokenUser.username
          );
        }
      }
    } else {
      // Try to verify as JWT token anyway
      decoded = verifyToken(token);
    }

    if (!decoded) {
      console.log("📚 API: Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    console.log("📚 API: Authenticated user:", decoded.username || decoded.id);

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // First, check if the user has a profile
    const userProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId: userProfile.userId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Ya estás inscrito en este curso" },
        { status: 400 }
      );
    }

    // Create new enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        studentId: userProfile.userId,
        enrolledAt: new Date(),
        progress: 0,
        status: "ENROLLED",
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            category: true,
            isActive: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log("📚 API: Course enrollment created:", enrollment.id);
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error creating course enrollment:", error);

    const errorDetails =
      error instanceof Error
        ? {
            message: error.message,
            code: (error as any).code,
            meta: (error as any).meta,
          }
        : { message: "Unknown error" };

    console.error("❌ Error details:", errorDetails);

    return NextResponse.json(
      {
        error: "Error al crear inscripción al curso",
        details:
          process.env.NODE_ENV === "development"
            ? errorDetails.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
