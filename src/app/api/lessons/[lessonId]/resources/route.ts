import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Fetch resources for the specific lesson
    const resources = await prisma.lessonResource.findMany({
      where: {
        lessonId: lessonId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        url: true,
        fileSize: true,
        orderIndex: true,
        isDownloadable: true,
        createdAt: true,
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    if (!resources || resources.length === 0) {
      return NextResponse.json({ resources: [] }, { status: 200 });
    }

    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lesson resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
