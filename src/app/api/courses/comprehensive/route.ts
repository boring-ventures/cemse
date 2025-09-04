import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET(request: NextRequest) {
  try {
    console.log("📚 API: Received request for comprehensive course data");

    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("📚 API: Authenticated user:", decoded.username);

    // Get courses with comprehensive data for the authenticated user
    const courses = await prisma.course.findMany({
      where: {
        // Temporarily show all courses for testing
        // instructorId: decoded.id, // Only get courses created by this user
      },
      include: {
        instructor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            jobTitle: true,
          },
        },
        modules: {
          include: {
            lessons: {
              include: {
                resources: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    url: true,
                    fileSize: true,
                  },
                },
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: [{ isMandatory: "desc" }, { createdAt: "desc" }],
    });

    // Transform courses to include comprehensive stats
    const transformedCourses = courses.map((course) => {
      // Calculate comprehensive stats
      const totalModules = course.modules.length;
      const totalLessons = course.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      );
      const totalResources = course.modules.reduce(
        (sum, module) =>
          sum +
          module.lessons.reduce(
            (lessonSum, lesson) => lessonSum + lesson.resources.length,
            0
          ),
        0
      );

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        thumbnail: course.thumbnail,
        videoPreview: course.videoPreview,
        objectives: course.objectives,
        prerequisites: course.prerequisites,
        duration: course.duration,
        level: course.level,
        category: course.category,
        isMandatory: course.isMandatory,
        isActive: course.isActive,
        rating: Number(course.rating || 0),
        studentsCount: course.studentsCount,
        enrollmentCount: course._count.enrollments,
        completionRate: Number(course.completionRate || 0),
        totalLessons: totalLessons,
        totalQuizzes: course.totalQuizzes,
        totalResources: totalResources,
        tags: course.tags,
        certification: course.certification,
        includedMaterials: course.includedMaterials,
        instructorId: course.instructorId,
        institutionName: course.institutionName,
        instructor: course.instructor
          ? {
              id: course.instructor.userId,
              name:
                `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() ||
                "Sin nombre",
              title: course.instructor.jobTitle || "Instructor",
              avatar: course.instructor.avatarUrl || "/avatars/default.jpg",
            }
          : null,
        organization: {
          id: "1",
          name: course.institutionName || "CEMSE",
          logo: "/logos/cemse.png",
        },
        // Include comprehensive data
        modules: course.modules.map((module) => ({
          id: module.id,
          courseId: course.id,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex,
          estimatedDuration: module.estimatedDuration,
          isLocked: module.isLocked,
          prerequisites: module.prerequisites,
          hasCertificate: module.hasCertificate,
          certificateTemplate: module.certificateTemplate,
          lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            moduleId: module.id,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            contentType: lesson.contentType,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            orderIndex: lesson.orderIndex,
            isRequired: lesson.isRequired,
            isPreview: lesson.isPreview,
            resources: lesson.resources,
          })),
        })),
        publishedAt: course.publishedAt?.toISOString(),
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      };
    });

    console.log(
      `📚 API: Returning ${transformedCourses.length} courses with comprehensive data`
    );
    return NextResponse.json({ courses: transformedCourses }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in comprehensive courses route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
