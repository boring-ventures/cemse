import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  getUserProfile,
  handleAuthError,
} from "@/lib/auth-utils";
import { CourseEnrollmentService } from "@/services/course-enrollment.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;

    console.log("📚 API: Fetching enrollment:", enrollmentId);

    // Authenticate user
    const user = await authenticateUser(request);
    console.log("📚 API: Authenticated user:", user.username);

    // Get user profile to ensure it exists
    await getUserProfile(user.id);

    // Check URL parameters for detailed data request
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get("detailed") === "true";

    let enrollment;

    if (includeDetails) {
      console.log("📚 API: Fetching detailed enrollment data");
      enrollment =
        await CourseEnrollmentService.getDetailedEnrollment(enrollmentId);
    } else {
      enrollment =
        await CourseEnrollmentService.getEnrollmentById(enrollmentId);
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const isOwner = await CourseEnrollmentService.verifyOwnership(
      enrollmentId,
      user.id
    );
    if (!isOwner) {
      return NextResponse.json(
        { error: "Unauthorized access to enrollment" },
        { status: 403 }
      );
    }

    console.log("📚 API: Successfully fetched enrollment:", enrollmentId);

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("❌ Error fetching enrollment:", error);

    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch enrollment",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;

    console.log("📚 API: Updating enrollment:", enrollmentId);

    // Authenticate user
    const user = await authenticateUser(request);
    console.log("📚 API: Authenticated user:", user.username);

    // Get user profile to ensure it exists
    await getUserProfile(user.id);

    // Verify ownership
    const isOwner = await CourseEnrollmentService.verifyOwnership(
      enrollmentId,
      user.id
    );
    if (!isOwner) {
      return NextResponse.json(
        { error: "Unauthorized access to enrollment" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      progress,
      status,
      currentModuleId,
      currentLessonId,
      timeSpent,
      moduleProgress,
      quizResults,
    } = body;

    console.log("📚 API: Updating enrollment with data:", {
      progress,
      status,
      currentModuleId,
      currentLessonId,
      timeSpent: timeSpent ? `${timeSpent} minutes` : undefined,
    });

    // Prepare update data
    const updateData: any = {};

    if (progress !== undefined) updateData.progress = progress;
    if (status) updateData.status = status;
    if (currentModuleId !== undefined)
      updateData.currentModuleId = currentModuleId;
    if (currentLessonId !== undefined)
      updateData.currentLessonId = currentLessonId;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (moduleProgress) updateData.moduleProgress = moduleProgress;
    if (quizResults) updateData.quizResults = quizResults;

    // Set timestamps based on status changes
    if (status === "IN_PROGRESS" && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === "COMPLETED" && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    // Update enrollment
    const enrollment = await CourseEnrollmentService.updateProgress(
      enrollmentId,
      updateData
    );

    // Recalculate progress if needed
    if (progress === undefined) {
      const calculatedProgress =
        await CourseEnrollmentService.calculateProgress(enrollmentId);
      console.log(`📚 API: Calculated progress: ${calculatedProgress}%`);
    }

    console.log("📚 API: Successfully updated enrollment:", enrollmentId);

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("❌ Error updating enrollment:", error);

    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update enrollment",
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
