import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Received request for job questions");

    const { searchParams } = new URL(request.url);
    const jobOfferId = searchParams.get("jobOfferId");
    const debug = searchParams.get("debug");

    // Debug endpoint to check database status without authentication
    if (debug === "true") {
      try {
        const totalJobOffers = await prisma.jobOffer.count();
        const availableJobOffers = await prisma.jobOffer.findMany({
          select: { id: true, title: true },
          take: 10,
        });

        return NextResponse.json({
          debug: true,
          totalJobOffers,
          availableJobOffers,
          message: "Database connection successful",
        });
      } catch (dbError) {
        console.error("🔍 API: Database connection error:", dbError);
        return NextResponse.json(
          {
            debug: true,
            error: "Database connection failed",
            details:
              dbError instanceof Error ? dbError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // Verify authentication for actual requests
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      console.log("🔍 API: Authentication failed:", authResult.error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 API: User authenticated:", authResult.user?.username);

    if (!jobOfferId) {
      console.log("🔍 API: Missing jobOfferId parameter");
      return NextResponse.json(
        { error: "jobOfferId is required" },
        { status: 400 }
      );
    }

    console.log("🔍 API: Fetching questions for job offer:", jobOfferId);

    // Debug: Check if database is accessible and count job offers
    try {
      const totalJobOffers = await prisma.jobOffer.count();
      console.log("🔍 API: Total job offers in database:", totalJobOffers);

      if (totalJobOffers === 0) {
        console.log("🔍 API: No job offers found in database");
        return NextResponse.json(
          { error: "No job offers available in the system" },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.error("🔍 API: Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // First, verify the job offer exists
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
      select: { id: true, title: true },
    });

    if (!jobOffer) {
      console.log("🔍 API: Job offer not found:", jobOfferId);

      // Debug: List some available job offer IDs
      const availableJobOffers = await prisma.jobOffer.findMany({
        select: { id: true, title: true },
        take: 5,
      });
      console.log("🔍 API: Available job offers:", availableJobOffers);

      return NextResponse.json(
        {
          error: "Job offer not found",
          availableJobOffers: availableJobOffers.map((jo) => ({
            id: jo.id,
            title: jo.title,
          })),
        },
        { status: 404 }
      );
    }

    console.log("🔍 API: Job offer found:", jobOffer.title);

    // Fetch job questions from database using Prisma
    const questions = await prisma.jobQuestion.findMany({
      where: {
        jobOfferId: jobOfferId,
      },
      orderBy: {
        orderIndex: "asc",
      },
      select: {
        id: true,
        jobOfferId: true,
        question: true,
        type: true,
        required: true,
        options: true,
        orderIndex: true,
      },
    });

    console.log("🔍 API: Found questions count:", questions.length);

    // Return empty array if no questions found (this is valid)
    return NextResponse.json(questions);
  } catch (error) {
    console.error("🔍 API: Error in job questions route:", error);

    // Return error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.jobOfferId || !body.question || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: jobOfferId, question, type" },
        { status: 400 }
      );
    }

    // Create job question using Prisma
    const question = await prisma.jobQuestion.create({
      data: {
        jobOfferId: body.jobOfferId,
        question: body.question,
        type: body.type,
        required: body.required || false,
        options: body.options || [],
        orderIndex: body.orderIndex || 0,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error creating job question:", error);
    return NextResponse.json(
      { error: "Error al crear pregunta de trabajo" },
      { status: 500 }
    );
  }
}
