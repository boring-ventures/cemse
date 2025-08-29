import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  getUserProfile,
  handleAuthError,
} from "@/lib/auth-utils";
import { CourseEnrollmentService } from "@/services/course-enrollment.service";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;

    console.log(
      "📚 API: Updating lesson progress for enrollment:",
      enrollmentId
    );

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
    const { lessonId, isCompleted, timeSpent, videoProgress } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    console.log("📚 API: Updating lesson progress:", {
      lessonId,
      isCompleted,
      timeSpent,
      videoProgress,
    });

    // Update or create lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted ?? false,
        timeSpent: timeSpent ?? 0,
        videoProgress: videoProgress ?? 0,
        lastWatchedAt: new Date(),
        ...(isCompleted && { completedAt: new Date() }),
      },
      create: {
        enrollmentId,
        lessonId,
        isCompleted: isCompleted ?? false,
        timeSpent: timeSpent ?? 0,
        videoProgress: videoProgress ?? 0,
        lastWatchedAt: new Date(),
        ...(isCompleted && { completedAt: new Date() }),
      },
    });

    // Recalculate overall progress
    const overallProgress =
      await CourseEnrollmentService.calculateProgress(enrollmentId);

    // Update enrollment's current lesson if provided
    if (isCompleted !== true) {
      await CourseEnrollmentService.updateProgress(enrollmentId, {
        currentLessonId: lessonId,
      });
    }

    console.log(
      `📚 API: Updated lesson progress. Overall progress: ${overallProgress}%`
    );

    return NextResponse.json({
      lessonProgress,
      overallProgress,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating lesson progress:", error);

    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update lesson progress",
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;

    console.log("📚 API: Fetching progress for enrollment:", enrollmentId);

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

    // Get all lesson progress for this enrollment
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { enrollmentId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
            orderIndex: true,
            isRequired: true,
          },
        },
      },
      orderBy: [
        { lesson: { moduleId: "asc" } },
        { lesson: { orderIndex: "asc" } },
      ],
    });

    // Get enrollment summary
    const enrollment =
      await CourseEnrollmentService.getEnrollmentById(enrollmentId);

    console.log(
      `📚 API: Found ${lessonProgress.length} lesson progress records`
    );

    return NextResponse.json({
      enrollment,
      lessonProgress,
    });
  } catch (error) {
    console.error("❌ Error fetching progress:", error);

    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch progress",
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
