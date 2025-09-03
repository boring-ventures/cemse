import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Fetch modules for the specific course
    const modules = await prisma.courseModule.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            contentType: true,
            videoUrl: true,
            duration: true,
            orderIndex: true,
            isRequired: true,
            isPreview: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    if (!modules || modules.length === 0) {
      return NextResponse.json({ modules: [] }, { status: 200 });
    }

    return NextResponse.json({ modules }, { status: 200 });
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
