import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    console.log("🔍 DEBUG: Checking course:", courseId);

    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get enrollments for this course
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: courseId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const debugInfo = {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        isActive: course.isActive,
        modulesCount: course._count.modules,
        enrollmentsCount: course._count.enrollments,
      },
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        orderIndex: module.orderIndex,
        lessonsCount: module.lessons.length,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          contentType: lesson.contentType,
        })),
      })),
      enrollments: enrollments.map((enrollment) => ({
        id: enrollment.id,
        studentId: enrollment.studentId,
        studentName:
          `${enrollment.student.firstName || ""} ${enrollment.student.lastName || ""}`.trim(),
        status: enrollment.status,
        progress: enrollment.progress.toString(),
      })),
    };

    return NextResponse.json({ debug: debugInfo }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in debug course route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
