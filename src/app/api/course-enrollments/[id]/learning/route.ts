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
      "📚 API: Received request for enrollment learning data:",
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

    // Get enrollment with full course data including modules, lessons, resources, and quizzes
    let enrollment = await prisma.courseEnrollment.findUnique({
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
      },
    });

    // If enrollment not found in database, check if it's a mock enrollment ID
    if (!enrollment && enrollmentId.startsWith("enroll_")) {
      console.log(
        "📚 API: Enrollment not found in database, generating mock learning data for:",
        enrollmentId
      );

      // Return mock enrollment data with learning structure
      const mockEnrollment = {
        id: enrollmentId,
        courseId:
          enrollmentId === "enroll_1"
            ? "course_1"
            : enrollmentId === "enroll_2"
              ? "course_2"
              : "course_3",
        studentId: decoded.id,
        enrolledAt: new Date().toISOString(),
        startedAt:
          enrollmentId !== "enroll_2" ? new Date().toISOString() : null,
        completedAt:
          enrollmentId === "enroll_3" ? new Date().toISOString() : null,
        progress:
          enrollmentId === "enroll_1"
            ? 25
            : enrollmentId === "enroll_2"
              ? 0
              : 100,
        status:
          enrollmentId === "enroll_1"
            ? "IN_PROGRESS"
            : enrollmentId === "enroll_2"
              ? "ENROLLED"
              : "COMPLETED",
        timeSpent:
          enrollmentId === "enroll_1"
            ? 120
            : enrollmentId === "enroll_2"
              ? 0
              : 600,
        course: {
          id:
            enrollmentId === "enroll_1"
              ? "course_1"
              : enrollmentId === "enroll_2"
                ? "course_2"
                : "course_3",
          title:
            enrollmentId === "enroll_1"
              ? "React para Principiantes"
              : enrollmentId === "enroll_2"
                ? "Introducción al Emprendimiento"
                : "Comunicación Efectiva",
          description:
            enrollmentId === "enroll_1"
              ? "Aprende React desde cero con proyectos prácticos"
              : enrollmentId === "enroll_2"
                ? "Fundamentos básicos para crear tu propio negocio"
                : "Mejora tus habilidades de comunicación personal y profesional",
          modules: [
            {
              id: "module_1",
              title: "Módulo 1: Introducción",
              description: "Conceptos básicos y fundamentos",
              orderIndex: 0,
              lessons: [
                {
                  id: "lesson_1",
                  title: "Lección 1: Primeros pasos",
                  description: "Introducción al tema",
                  content: "Contenido de la lección de introducción",
                  contentType: "VIDEO",
                  videoUrl: "https://www.youtube.com/watch?v=a5uQMwRMHcs",
                  duration: 15,
                  orderIndex: 0,
                  isRequired: true,
                  isPreview: true,
                  resources: [
                    {
                      id: "resource_1",
                      title: "Material de apoyo",
                      type: "PDF",
                      url: "/resources/lesson1-material.pdf",
                      orderIndex: 0,
                      isDownloadable: true,
                    },
                  ],
                  quizzes: [],
                },
              ],
            },
          ],
          instructor: {
            id: "instructor_1",
            firstName: "Instructor",
            lastName: "Demo",
            email: "instructor@demo.com",
          },
        },
        student: {
          id: decoded.id,
          firstName: "Usuario",
          lastName: "Demo",
          email: decoded.username + "@email.com",
        },
      };

      return NextResponse.json({ enrollment: mockEnrollment }, { status: 200 });
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

    console.log("📚 API: Found enrollment for learning:", enrollment.id);
    return NextResponse.json({ enrollment }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in enrollment learning route:", error);

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
