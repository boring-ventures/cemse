import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("🔍 API: Fetching course with ID:", resolvedParams.id);

    // Get auth token (optional for public courses)
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
        console.log("🔍 API: Authenticated user:", decoded.username);
      } catch (error) {
        console.log("🔍 API: Invalid token, proceeding without auth");
      }
    }

    // Check if detailed modules and lessons are requested
    const { searchParams } = new URL(request.url);
    const includeModules = searchParams.get("include")?.includes("modules");
    const includeLessons = searchParams.get("include")?.includes("lessons");

    // Build dynamic include object
    const includeOptions: any = {
      instructor: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          jobTitle: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
      },
    };

    // Add modules with optional lessons
    if (includeModules || includeLessons) {
      includeOptions.modules = {
        include: {
          ...(includeLessons && {
            lessons: {
              include: {
                resources: {
                  orderBy: { orderIndex: "asc" },
                },
                quizzes: {
                  include: {
                    questions: {
                      include: {
                        options: {
                          orderBy: { orderIndex: "asc" },
                        },
                      },
                      orderBy: { orderIndex: "asc" },
                    },
                  },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          }),
        },
        orderBy: { orderIndex: "asc" },
      };
    } else {
      // Default behavior - just basic module info
      includeOptions.modules = {
        select: {
          id: true,
          title: true,
          orderIndex: true,
        },
        orderBy: { orderIndex: "asc" },
      };
    }

    // Get course from database
    const course = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
      include: includeOptions,
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Transform course to match expected format
    const transformedCourse = {
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
      price: Number(course.price || 0),
      rating: Number(course.rating || 0),
      studentsCount: course.studentsCount,
      enrollmentCount: course._count.enrollments,
      completionRate: Number(course.completionRate || 0),
      totalLessons: course.totalLessons,
      totalQuizzes: course.totalQuizzes,
      totalResources: course.totalResources,
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
      // Include modules if they were requested and contain lessons
      ...(course.modules &&
        (includeModules || includeLessons) && {
          modules: course.modules.map((module: any) => ({
            id: module.id,
            courseId: course.id,
            title: module.title,
            description: module.description || "",
            order: module.orderIndex || 0,
            duration: module.duration || 0,
            isLocked: module.isLocked || false,
            lessons: module.lessons
              ? module.lessons.map((lesson: any) => ({
                  id: lesson.id,
                  moduleId: module.id,
                  title: lesson.title,
                  description: lesson.description || "",
                  type: lesson.type,
                  content: {
                    videoUrl: lesson.videoUrl,
                    textContent: lesson.textContent,
                    slides: lesson.slides || [],
                    attachments: lesson.attachments || [],
                  },
                  duration: lesson.duration || 0,
                  order: lesson.orderIndex || 0,
                  isPreview: lesson.isPreview || false,
                  resources: lesson.resources || [],
                  createdAt: lesson.createdAt.toISOString(),
                  updatedAt: lesson.updatedAt.toISOString(),
                }))
              : [],
            createdAt: module.createdAt.toISOString(),
            updatedAt: module.updatedAt.toISOString(),
          })),
        }),
      publishedAt: course.publishedAt?.toISOString(),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };

    console.log(
      "🔍 API: Returning course from database:",
      transformedCourse.id
    );
    return NextResponse.json({ course: transformedCourse }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in course detail route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
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
    console.log("📚 API: Updating course with ID:", resolvedParams.id);

    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("📚 API: Authenticated user:", decoded.username);

    const body = await request.json();

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Update course in database
    const course = await prisma.course.update({
      where: { id: resolvedParams.id },
      data: {
        title: body.title,
        description: body.description,
        shortDescription: body.shortDescription || null,
        thumbnail: body.thumbnail || null,
        videoPreview: body.videoPreview || null,
        objectives: body.objectives || [],
        prerequisites: body.prerequisites || [],
        duration: parseInt(body.duration) || 0,
        level: body.level || "BEGINNER",
        category: body.category,
        isMandatory: body.isMandatory || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        price: parseFloat(body.price) || 0,
        tags: body.tags || [],
        certification:
          body.certification !== undefined ? body.certification : true,
        includedMaterials: body.includedMaterials || [],
        institutionName: body.institutionName || "CEMSE",
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
      },
    });

    console.log("✅ Course updated successfully:", course.id);
    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("📚 API: Deleting course with ID:", resolvedParams.id);

    // Get auth token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("📚 API: Authenticated user:", decoded.username);

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Delete course from database
    await prisma.course.delete({
      where: { id: resolvedParams.id },
    });

    console.log("✅ Course deleted successfully:", resolvedParams.id);
    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
