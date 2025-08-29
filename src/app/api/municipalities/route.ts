import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🏛️ Municipalities API - Fetching municipalities");

    const municipalities = await prisma.municipality.findMany({
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        population: true,
        isActive: true,
      },
      where: {
        isActive: true,
      },
      orderBy: [
        { department: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`🏛️ Municipalities API - Successfully fetched ${municipalities.length} municipalities`);

    return NextResponse.json({
      municipalities,
      total: municipalities.length
    });

  } catch (error) {
    console.error("🏛️ Municipalities API - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch municipalities" },
      { status: 500 }
    );
  }
}
