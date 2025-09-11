import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Received request for entrepreneurships");

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const municipality = searchParams.get("municipality");
    const ownerId = searchParams.get("ownerId");
    const isPublic = searchParams.get("isPublic");

    // Build filter conditions
    const where: any = {
      isActive: true, // Only show active entrepreneurships
    };

    if (category) where.category = category;
    if (municipality) where.municipality = municipality;
    if (ownerId) where.ownerId = ownerId;
    if (isPublic !== null) where.isPublic = isPublic === "true";

    // Get unique entrepreneurship owners from database
    // First, get unique owner IDs
    const uniqueOwnerIds = await prisma.entrepreneurship.findMany({
      where,
      select: {
        ownerId: true,
      },
      distinct: ["ownerId"],
    });

    // Then get the latest entrepreneurship for each unique owner
    const entrepreneurships = await Promise.all(
      uniqueOwnerIds.map(async ({ ownerId }) => {
        return await prisma.entrepreneurship.findFirst({
          where: {
            ...where,
            ownerId: ownerId,
          },
          include: {
            owner: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                municipality: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      })
    );

    // Filter out any null results
    const validEntrepreneurships = entrepreneurships.filter(Boolean);

    console.log(
      "🔍 API: Found",
      validEntrepreneurships.length,
      "unique entrepreneurship owners"
    );
    return NextResponse.json(validEntrepreneurships);
  } catch (error) {
    console.error("Error in entrepreneurships route:", error);
    return NextResponse.json(
      { error: "Error al cargar emprendimientos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 API: Received request to create entrepreneurship");

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
    console.log("🔍 API: Authenticated user:", decoded.username);

    const body = await request.json();
    console.log("🔍 API: Request body:", body);

    const {
      name,
      description,
      category,
      subcategory,
      businessStage,
      logo,
      images,
      website,
      email,
      phone,
      address,
      municipality,
      department,
      socialMedia,
      founded,
      employees,
      annualRevenue,
      businessModel,
      targetMarket,
      isPublic = true,
    } = body;

    // Validate required fields
    if (!name || !description || !category || !businessStage || !municipality) {
      return NextResponse.json(
        {
          error:
            "Faltan campos requeridos: name, description, category, businessStage, municipality",
        },
        { status: 400 }
      );
    }

    // Create entrepreneurship
    const entrepreneurship = await prisma.entrepreneurship.create({
      data: {
        ownerId: decoded.id,
        name: name.trim(),
        description: description.trim(),
        category,
        subcategory,
        businessStage,
        logo,
        images: images || [],
        website,
        email,
        phone,
        address,
        municipality,
        department: department || "Cochabamba",
        socialMedia,
        founded: founded ? new Date(founded) : null,
        employees,
        annualRevenue,
        businessModel,
        targetMarket,
        isPublic,
        isActive: true,
        viewsCount: 0,
        rating: 0,
        reviewsCount: 0,
      },
      include: {
        owner: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            municipality: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    console.log("🔍 API: Entrepreneurship created:", entrepreneurship.id);
    return NextResponse.json(entrepreneurship, { status: 201 });
  } catch (error) {
    console.error("Error creating entrepreneurship:", error);
    return NextResponse.json(
      { error: "Error al crear emprendimiento" },
      { status: 500 }
    );
  }
}
