import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET(request: NextRequest) {
  try {
    console.log("📚 API: Received request for lessons");

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    const lessonId = searchParams.get("id");

    if (lessonId) {
      // Get single lesson
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
          resources: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              url: true,
              description: true,
              orderIndex: true,
            },
          },
          quizzes: {
            select: {
              id: true,
              title: true,
              description: true,
              timeLimit: true,
              passingScore: true,
            },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { message: "Lesson not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ lesson }, { status: 200 });
    }

    if (moduleId) {
      // Get lessons for a module
      const lessons = await prisma.lesson.findMany({
        where: { moduleId },
        include: {
          resources: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              url: true,
              description: true,
              orderIndex: true,
            },
          },
          quizzes: {
            select: {
              id: true,
              title: true,
              description: true,
              timeLimit: true,
              passingScore: true,
            },
          },
          _count: {
            select: {
              resources: true,
              quizzes: true,
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      });

      const transformedLessons = lessons.map((lesson) => ({
        id: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        contentType: lesson.contentType,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration || 0,
        orderIndex: lesson.orderIndex,
        isRequired: lesson.isRequired,
        isPreview: lesson.isPreview,
        attachments: lesson.attachments || [],
        resources: lesson.resources,
        quizzes: lesson.quizzes,
        resourceCount: lesson._count.resources,
        quizCount: lesson._count.quizzes,
      }));

      return NextResponse.json(
        { lessons: transformedLessons },
        { status: 200 }
      );
    }

    // Get all lessons (admin only)
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const lessons = await prisma.lesson.findMany({
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
        resources: {
          orderBy: { orderIndex: "asc" },
        },
        quizzes: true,
        _count: {
          select: {
            resources: true,
            quizzes: true,
          },
        },
      },
      orderBy: [{ moduleId: "asc" }, { orderIndex: "asc" }],
    });

    return NextResponse.json({ lessons }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in lessons route:", error);

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
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? errorDetails.message
            : "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📚 API: Received POST request for lesson creation");

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

    // Create lesson in database
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: body.moduleId,
        title: body.title,
        description: body.description,
        content: body.content || "",
        contentType: body.contentType || "TEXT",
        videoUrl: body.videoUrl,
        duration: body.duration || 0,
        orderIndex: body.orderIndex || 0,
        isRequired: body.isRequired !== undefined ? body.isRequired : true,
        isPreview: body.isPreview || false,
        attachments: body.attachments || [],
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
        resources: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    console.log("✅ Lesson created successfully:", lesson.id);
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating lesson:", error);

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
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? errorDetails.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
