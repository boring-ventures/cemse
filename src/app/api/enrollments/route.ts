import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  getUserProfile,
  handleAuthError,
} from "@/lib/auth-utils";
import { CourseEnrollmentService } from "@/services/course-enrollment.service";

export async function GET(request: NextRequest) {
  try {
    console.log("📚 API: Fetching user enrollments");

    // Authenticate user
    const user = await authenticateUser(request);
    console.log("📚 API: Authenticated user:", user.username);

    // Get user profile to ensure it exists
    const profile = await getUserProfile(user.id);

    // Get all enrollments for the user
    const enrollments = await CourseEnrollmentService.getUserEnrollments(
      user.id
    );

    console.log(
      `📚 API: Found ${enrollments.length} enrollments for user ${user.username}`
    );

    return NextResponse.json({
      enrollments,
      user: {
        id: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error);

    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch enrollments",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📚 API: Creating new enrollment");

    // Authenticate user
    const user = await authenticateUser(request);
    console.log("📚 API: Authenticated user:", user.username);

    // Get user profile to ensure it exists
    await getUserProfile(user.id);

    // Parse request body
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    console.log(`📚 API: Creating enrollment for course ${courseId}`);

    // Create enrollment
    const enrollment = await CourseEnrollmentService.createEnrollment(
      user.id,
      courseId
    );

    console.log(`📚 API: Successfully created enrollment ${enrollment.id}`);

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating enrollment:", error);

    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes("already enrolled")) {
        return NextResponse.json(
          { error: "Ya estás inscrito en este curso" },
          { status: 409 }
        );
      }

      if (
        error.message.includes("not found") ||
        error.message.includes("not active")
      ) {
        return NextResponse.json(
          { error: "Curso no encontrado o no disponible" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create enrollment",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
