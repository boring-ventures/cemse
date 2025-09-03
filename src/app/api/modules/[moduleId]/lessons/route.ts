import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    // Fetch lessons for the specific module
    const lessons = await prisma.lesson.findMany({
      where: {
        moduleId: moduleId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        contentType: true,
        videoUrl: true,
        duration: true,
        orderIndex: true,
        isRequired: true,
        isPreview: true,
        attachments: true,
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    if (!lessons || lessons.length === 0) {
      return NextResponse.json({ lessons: [] }, { status: 200 });
    }

    return NextResponse.json({ lessons }, { status: 200 });
  } catch (error) {
    console.error("Error fetching module lessons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
