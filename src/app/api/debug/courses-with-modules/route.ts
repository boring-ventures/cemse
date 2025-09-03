import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 DEBUG: Checking courses with modules in database");

    // Get all courses with their modules
    const coursesWithModules = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: "asc" },
            },
            _count: {
              select: {
                lessons: true,
              },
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
      orderBy: { createdAt: "desc" },
    });

    console.log(
      "🔍 DEBUG: Found courses with modules:",
      coursesWithModules.length
    );

    // Log detailed information about each course
    coursesWithModules.forEach((course) => {
      console.log("🔍 DEBUG: Course:", {
        id: course.id,
        title: course.title,
        slug: course.slug,
        isActive: course.isActive,
        moduleCount: course._count.modules,
        enrollmentCount: course._count.enrollments,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          orderIndex: m.orderIndex,
          lessonCount: m._count.lessons,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            orderIndex: l.orderIndex,
          })),
        })),
      });
    });

    return NextResponse.json(
      {
        totalCourses: coursesWithModules.length,
        courses: coursesWithModules.map((course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          isActive: course.isActive,
          moduleCount: course._count.modules,
          enrollmentCount: course._count.enrollments,
          modules: course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            orderIndex: m.orderIndex,
            lessonCount: m._count.lessons,
            lessons: m.lessons,
          })),
        })),
        message: "Debug information retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in debug courses-with-modules route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
