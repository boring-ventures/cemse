import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { API_BASE } from "../../../../lib/api";
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
    console.log("📚 API: Received GET request for enrollment:", enrollmentId);

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

    // Check for include parameter
    const { searchParams } = new URL(request.url);
    const includeParam = searchParams.get("include");
    const includeResources = includeParam?.includes("resources");
    const includeQuizzes = includeParam?.includes("quizzes");

    // Build include object based on parameters
    const includeOptions: any = {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  ...(includeResources && {
                    resources: {
                      orderBy: { orderIndex: "asc" },
                    },
                  }),
                  ...(includeQuizzes && {
                    quizzes: {
                      include: {
                        questions: {
                          orderBy: { orderIndex: "asc" },
                        },
                      },
                    },
                  }),
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
    };

    // Get enrollment
    console.log("📚 API: Querying enrollment with ID:", enrollmentId);
    console.log(
      "📚 API: Include options:",
      JSON.stringify(includeOptions, null, 2)
    );

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: includeOptions,
    });

    console.log("📚 API: Found enrollment:", !!enrollment);
    if (enrollment) {
      const enrollmentAny = enrollment as any;
      console.log(
        "📚 API: Course modules count:",
        enrollmentAny.course?.modules?.length || 0
      );
      console.log(
        "📚 API: Course modules:",
        enrollmentAny.course?.modules?.map((m: any) => ({
          id: m.id,
          title: m.title,
          lessonsCount: m.lessons?.length || 0,
        })) || []
      );
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

    console.log("📚 API: Found enrollment:", enrollment.id);
    return NextResponse.json({ enrollment }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in enrollment GET route:", error);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    console.log(
      "🔍 API: Received PUT request for enrollment:",
      resolvedParams.id
    );

    const url = new URL(`${API_BASE}/course-enrollments/${resolvedParams.id}`);

    console.log("🔍 API: Forwarding to backend:", url.toString());
    console.log(
      "🔍 API: Authorization header:",
      request.headers.get("authorization") ? "Present" : "Missing"
    );

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: request.headers.get("authorization") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("🔍 API: Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 API: Backend error:", errorText);
      return NextResponse.json(
        { message: `Backend error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "🔍 API: Backend data received for enrollment update:",
      resolvedParams.id
    );
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in enrollment PUT route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
