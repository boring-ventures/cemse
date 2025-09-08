import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log(
      "🏛️ GET /api/municipality/public - Fetching public municipalities"
    );

    // Fetch only active municipalities for public display
    const municipalities = await prisma.municipality.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        address: true,
        website: true,
        email: true,
        phone: true,
        institutionType: true,
        customType: true,
        primaryColor: true,
        secondaryColor: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ department: "asc" }, { name: "asc" }],
    });

    console.log(
      `🏛️ GET /api/municipality/public - Found ${municipalities.length} active municipalities`
    );

    return NextResponse.json({ municipalities });
  } catch (error) {
    console.error("Error fetching public municipalities:", error);
    return NextResponse.json(
      { error: "Error al cargar los municipios" },
      { status: 500 }
    );
  }
}
