import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authenticateUser,
  getUserProfile,
  handleAuthError,
} from "@/lib/auth-utils";
import { CourseEnrollmentService } from "@/services/course-enrollment.service";

export async function POST(request: NextRequest) {
  try {
    console.log("🎥 API: Received request to update video progress");

    // Parse request body first to avoid issues
    let body;
    try {
      body = await request.json();
      console.log(
        "🎥 API: Request body parsed successfully:",
        JSON.stringify(body, null, 2)
      );
    } catch (parseError) {
      console.error("🎥 API: Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Early return for debugging - let's see what we're receiving
    if (!body || typeof body !== "object") {
      console.error("🎥 API: Body is not an object:", body, typeof body);
      return NextResponse.json(
        { error: "Request body must be an object", received: typeof body },
        { status: 400 }
      );
    }

    // TEMPORARY: Return early with success to avoid video progress errors while debugging video playback
    console.log(
      "🎥 API: DEBUGGING - Returning early success to avoid blocking video playback"
    );
    return NextResponse.json({
      message:
        "Debug: Video progress update temporarily disabled for debugging",
      body: body,
      timestamp: new Date().toISOString(),
    });

    const { enrollmentId, lessonId, videoProgress, timeSpent } = body;

    console.log("🎥 API: Updating video progress:", {
      enrollmentId,
      lessonId,
      videoProgress,
      timeSpent,
    });

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: "enrollmentId and lessonId are required" },
        { status: 400 }
      );
    }

    if (
      videoProgress === undefined ||
      videoProgress === null ||
      isNaN(videoProgress)
    ) {
      return NextResponse.json(
        { error: "videoProgress is required and must be a valid number" },
        { status: 400 }
      );
    }

    // Ensure timeSpent is a valid integer, default to 0 if not
    const validTimeSpent =
      timeSpent && !isNaN(timeSpent) ? Math.floor(Number(timeSpent)) : 0;

    // Authenticate user
    let user;
    try {
      console.log("🎥 API: Starting authentication...");
      user = await authenticateUser(request);
      console.log("🎥 API: Authenticated user:", user?.username || "unknown");
      console.log("🎥 API: User object:", JSON.stringify(user, null, 2));
    } catch (authError: unknown) {
      console.error("🎥 API: Authentication error:", authError);
      console.error(
        "🎥 API: Authentication error stack:",
        // @ts-ignore
        authError instanceof Error ? authError.stack : "No stack"
      );
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Get user profile to ensure it exists
    try {
      console.log("🎥 API: Getting user profile for user ID:", user?.id);
      const profile = await getUserProfile(user.id);
      console.log(
        "🎥 API: User profile verified:",
        profile ? "found" : "not found"
      );
    } catch (profileError: unknown) {
      console.error("🎥 API: User profile error:", profileError);
      console.error(
        "🎥 API: Profile error stack:",
        // @ts-ignore
        profileError instanceof Error ? profileError.stack : "No stack"
      );
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Verify enrollment ownership
    let isOwner;
    try {
      console.log("🎥 API: Verifying ownership for:", {
        enrollmentId,
        userId: user.id,
      });
      isOwner = await CourseEnrollmentService.verifyOwnership(
        enrollmentId,
        user.id
      );
      console.log("🎥 API: Ownership verified:", isOwner);
    } catch (ownershipError: unknown) {
      console.error("🎥 API: Ownership verification error:", ownershipError);
      console.error(
        "🎥 API: Ownership error stack:",
        // @ts-ignore
        ownershipError instanceof Error ? ownershipError.stack : "No stack"
      );
      return NextResponse.json(
        { error: "Error verifying enrollment ownership" },
        { status: 500 }
      );
    }

    if (!isOwner) {
      return NextResponse.json(
        { error: "Unauthorized access to enrollment" },
        { status: 403 }
      );
    }

    // Verify lesson exists and belongs to the course
    let enrollment;
    try {
      enrollment = await prisma.courseEnrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    where: { id: lessonId },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      });
      console.log("🎥 API: Enrollment query completed");
    } catch (enrollmentError) {
      console.error("🎥 API: Enrollment query error:", enrollmentError);
      return NextResponse.json(
        { error: "Error querying enrollment" },
        { status: 500 }
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Check if lesson belongs to the course
    const lessonExists = enrollment.course.modules.some((module: any) =>
      module.lessons.some((lesson: any) => lesson.id === lessonId)
    );

    if (!lessonExists) {
      return NextResponse.json(
        { error: "Lesson not found in course" },
        { status: 404 }
      );
    }

    // Convert percentage to decimal if needed
    const normalizedProgress =
      videoProgress > 1 ? videoProgress / 100 : videoProgress;
    const clampedProgress = Math.max(0, Math.min(1, normalizedProgress));

    console.log("🎥 API: Progress normalized:", {
      original: videoProgress,
      normalized: normalizedProgress,
      clamped: clampedProgress,
    });

    // Validate all data before Prisma operation
    console.log("🎥 API: Pre-Prisma validation:", {
      enrollmentId: {
        value: enrollmentId,
        type: typeof enrollmentId,
        isNull: enrollmentId === null,
        isUndefined: enrollmentId === undefined,
      },
      lessonId: {
        value: lessonId,
        type: typeof lessonId,
        isNull: lessonId === null,
        isUndefined: lessonId === undefined,
      },
      clampedProgress: {
        value: clampedProgress,
        type: typeof clampedProgress,
        isNull: clampedProgress === null,
        isUndefined: clampedProgress === undefined,
        isNaN: isNaN(clampedProgress),
      },
      validTimeSpent: {
        value: validTimeSpent,
        type: typeof validTimeSpent,
        isNull: validTimeSpent === null,
        isUndefined: validTimeSpent === undefined,
        isNaN: isNaN(validTimeSpent),
      },
    });

    // Ensure all required fields are strings/numbers and not null
    if (!enrollmentId || typeof enrollmentId !== "string") {
      throw new Error(
        `Invalid enrollmentId: ${enrollmentId} (type: ${typeof enrollmentId})`
      );
    }
    if (!lessonId || typeof lessonId !== "string") {
      throw new Error(
        `Invalid lessonId: ${lessonId} (type: ${typeof lessonId})`
      );
    }
    if (typeof clampedProgress !== "number" || isNaN(clampedProgress)) {
      throw new Error(
        `Invalid clampedProgress: ${clampedProgress} (type: ${typeof clampedProgress})`
      );
    }
    if (
      typeof validTimeSpent !== "number" ||
      isNaN(validTimeSpent) ||
      !Number.isInteger(validTimeSpent)
    ) {
      throw new Error(
        `Invalid validTimeSpent: ${validTimeSpent} (type: ${typeof validTimeSpent}, isInteger: ${Number.isInteger(validTimeSpent)})`
      );
    }

    // Update or create lesson progress
    let lessonProgress;
    try {
      console.log("🎥 API: Attempting Prisma upsert with validated data");
      // Try to find existing record first
      const existingProgress = await prisma.lessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: {
            enrollmentId,
            lessonId,
          },
        },
      });

      console.log(
        "🎥 API: Existing progress found:",
        existingProgress ? "YES" : "NO"
      );

      if (existingProgress) {
        // Update existing record
        lessonProgress = await prisma.lessonProgress.update({
          where: {
            enrollmentId_lessonId: {
              enrollmentId,
              lessonId,
            },
          },
          data: {
            videoProgress: clampedProgress,
            timeSpent: validTimeSpent,
            lastWatchedAt: new Date(),
          },
        });
        console.log("🎥 API: Updated existing lesson progress");
      } else {
        // Create new record
        lessonProgress = await prisma.lessonProgress.create({
          data: {
            enrollmentId,
            lessonId,
            videoProgress: clampedProgress,
            timeSpent: validTimeSpent,
            lastWatchedAt: new Date(),
            isCompleted: false,
          },
        });
        console.log("🎥 API: Created new lesson progress");
      }
      console.log("🎥 API: Lesson progress updated successfully");
    } catch (progressError: unknown) {
      console.error("🎥 API: Lesson progress update error:", progressError);
      console.error(
        "🎥 API: Error stack:",
        // @ts-ignore
        progressError instanceof Error ? progressError.stack : "No stack trace"
      );
      console.error("🎥 API: Upsert data:", {
        enrollmentId,
        lessonId,
        videoProgress: clampedProgress,
        timeSpent: validTimeSpent,
      });
      return NextResponse.json(
        {
          error: "Error updating lesson progress",
          details:
            // @ts-ignore - progressError is typed as unknown in catch block
            progressError instanceof Error
              ? (progressError as Error).message
              : String(progressError),
        },
        { status: 500 }
      );
    }

    // Update enrollment's current lesson and time spent
    try {
      await prisma.courseEnrollment.update({
        where: { id: enrollmentId },
        data: {
          currentLessonId: lessonId,
          timeSpent: {
            increment: validTimeSpent,
          },
        },
      });
      console.log("🎥 API: Enrollment updated");
    } catch (enrollmentUpdateError) {
      console.error("🎥 API: Enrollment update error:", enrollmentUpdateError);
      // Don't return error here as lesson progress was already updated
      console.log("🎥 API: Continuing despite enrollment update error");
    }

    console.log("🎥 API: Video progress updated successfully:", {
      lessonId,
      videoProgress: lessonProgress.videoProgress,
      timeSpent: lessonProgress.timeSpent,
    });

    return NextResponse.json({
      lessonProgress,
      message: "Video progress updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating video progress:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error(
      "❌ Error name:",
      error instanceof Error ? error.name : "Unknown error type"
    );
    console.error(
      "❌ Error message:",
      error instanceof Error ? error.message : String(error)
    );

    // Check if it's an authentication error first
    const authError = handleAuthError(error);
    if (authError.status < 500) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      );
    }

    // Provide more specific error information
    let errorMessage = "Failed to update video progress";
    let errorDetails = undefined;

    if (error instanceof Error) {
      if (error.message.includes("payload")) {
        errorMessage = "Database operation failed due to invalid data";
        errorDetails =
          process.env.NODE_ENV === "development" ? error.message : undefined;
      } else if (error.message.includes("Invalid")) {
        errorMessage = "Invalid data provided";
        errorDetails =
          process.env.NODE_ENV === "development" ? error.message : undefined;
      } else {
        errorDetails =
          process.env.NODE_ENV === "development" ? error.message : undefined;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
