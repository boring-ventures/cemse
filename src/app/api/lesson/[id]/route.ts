import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📚 API: Received GET request for lesson:", params.id);

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
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
  } catch (error) {
    console.error("❌ Error fetching lesson:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📚 API: Received PUT request for lesson:", params.id);

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
    const { id, ...updateData } = body;

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update lesson in database
    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        title: updateData.title,
        description: updateData.description,
        content: updateData.content,
        contentType: updateData.contentType,
        videoUrl: updateData.videoUrl,
        duration: updateData.duration,
        orderIndex: updateData.orderIndex,
        isRequired: updateData.isRequired,
        isPreview: updateData.isPreview,
        attachments: updateData.attachments,
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

    console.log("✅ Lesson updated successfully:", lesson.id);
    return NextResponse.json({ lesson }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating lesson:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("📚 API: Received DELETE request for lesson:", params.id);

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

    // Check if lesson exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: { id: true, moduleId: true },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 404 }
      );
    }

    // Delete lesson from database (this will cascade delete related resources and quizzes)
    await prisma.lesson.delete({
      where: { id: params.id },
    });

    console.log("✅ Lesson deleted successfully:", params.id);
    return NextResponse.json(
      {
        message: "Lesson deleted successfully",
        deletedLessonId: params.id,
        moduleId: existingLesson.moduleId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting lesson:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
