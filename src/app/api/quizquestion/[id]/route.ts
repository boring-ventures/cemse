import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("❓ API: Received request for single quiz question");

    // Get auth token from Authorization header or cookies
    let token = request.headers.get("authorization")?.replace("Bearer ", "");

    // If no Bearer token, try to get from cookies
    if (!token) {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      token = cookieStore.get("cemse-auth-token")?.value;
      console.log("❓ API: Using cookie-based authentication");
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("❓ API: Authenticated user:", decoded.username);

    const question = await prisma.quizQuestion.findUnique({
      where: { id: params.id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    console.log("❓ API: Found quiz question:", question.id);
    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in single quiz question route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
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
    console.log("❓ API: Received request to update quiz question");

    // Get auth token from Authorization header or cookies
    let token = request.headers.get("authorization")?.replace("Bearer ", "");

    // If no Bearer token, try to get from cookies
    if (!token) {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      token = cookieStore.get("cemse-auth-token")?.value;
      console.log("❓ API: Using cookie-based authentication");
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("❓ API: Authenticated user:", decoded.username);

    const body = await request.json();
    const {
      quizId,
      question,
      type,
      options,
      correctAnswer,
      explanation,
      points,
      orderIndex,
    } = body;

    // Update quiz question
    const quizQuestion = await prisma.quizQuestion.update({
      where: { id: params.id },
      data: {
        quizId,
        question,
        type,
        options: options || [],
        correctAnswer,
        explanation: explanation || null,
        points: points || 1,
        orderIndex: orderIndex || 0,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log("❓ API: Quiz question updated:", quizQuestion.id);
    return NextResponse.json({ question: quizQuestion }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating quiz question:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
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
    console.log("❓ API: Received request to delete quiz question");

    // Get auth token from Authorization header or cookies
    let token = request.headers.get("authorization")?.replace("Bearer ", "");

    // If no Bearer token, try to get from cookies
    if (!token) {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      token = cookieStore.get("cemse-auth-token")?.value;
      console.log("❓ API: Using cookie-based authentication");
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("❓ API: Authenticated user:", decoded.username);

    // Delete quiz question
    await prisma.quizQuestion.delete({
      where: { id: params.id },
    });

    console.log("❓ API: Quiz question deleted:", params.id);
    return NextResponse.json(
      { message: "Quiz question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting quiz question:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
