import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;
    console.log(
      "📚 API: Received request for full enrollment data:",
      enrollmentId
    );

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

    // Get enrollment with complete course data - simplified first to debug
    console.log(
      "📚 API: Starting database query for enrollment:",
      enrollmentId
    );

    let enrollment;
    try {
      // First try a simple query to see if the enrollment exists
      enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
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

      console.log("📚 API: Basic enrollment query successful:", !!enrollment);

      if (!enrollment) {
        console.log("📚 API: Enrollment not found with ID:", enrollmentId);
        return NextResponse.json(
          { error: "Enrollment not found" },
          { status: 404 }
        );
      }

      // Now try to get the full data with modules and lessons
      console.log(
        "📚 API: Fetching full enrollment data with modules and lessons"
      );
      enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    include: {
                      resources: {
                        orderBy: { orderIndex: "asc" },
                      },
                      quizzes: {
                        include: {
                          questions: {
                            orderBy: { orderIndex: "asc" },
                          },
                        },
                      },
                    },
                    orderBy: { orderIndex: "asc" },
                  },
                },
                orderBy: { orderIndex: "asc" },
              },
              instructor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
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
          lessonProgress: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  moduleId: true,
                },
              },
            },
          },
        },
      });

      console.log(
        "📚 API: Full enrollment query successful with modules:",
        enrollment?.course?.modules?.length || 0
      );
      if (enrollment?.course?.modules) {
        console.log(
          "📚 API: Full endpoint - Course modules:",
          enrollment.course.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            lessonsCount: m.lessons?.length || 0,
          }))
        );
      }
    } catch (dbError) {
      console.error("❌ Database query error:", dbError);
      throw dbError;
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check if the authenticated user owns this enrollment
    if (enrollment.studentId !== decoded.id) {
      return NextResponse.json(
        { error: "Unauthorized access to enrollment" },
        { status: 403 }
      );
    }

    console.log("📚 API: Found full enrollment data:", enrollment.id);
    return NextResponse.json({ enrollment }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in full enrollment route:", error);

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
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? errorDetails.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
