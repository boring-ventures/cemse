import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔍 DEBUG: Fetching all municipalities for debugging");

    // Get all municipalities to see what exists
    const municipalities = await prisma.municipality.findMany({
      select: {
        id: true,
        name: true,
        department: true,
        username: true,
        email: true,
        institutionType: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log("🏛️ DEBUG: Found municipalities:", municipalities.map(m => ({
      name: m.name,
      department: m.department,
      type: m.institutionType,
      username: m.username,
      email: m.email
    })));

    return NextResponse.json({
      count: municipalities.length,
      municipalities: municipalities.map(m => ({
        id: m.id,
        name: m.name,
        department: m.department,
        username: m.username,
        email: m.email,
        institutionType: m.institutionType,
        isActive: m.isActive,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Error fetching debug data", details: error },
      { status: 500 }
    );
  }
}

