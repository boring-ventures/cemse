import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUsernameFormat, isCuidFormat } from "@/lib/utils/municipality-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    // Mock authentication check for development
    const mockUserRole = "MUNICIPAL_GOVERNMENTS";

    if (
      mockUserRole !== "SUPERADMIN" &&
      mockUserRole !== "MUNICIPAL_GOVERNMENTS"
    ) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { identifier } = resolvedParams;

    let municipality;

    if (isCuidFormat(identifier)) {
      // It's a CUID, search by ID
      municipality = await prisma.municipality.findUnique({
        where: { id: identifier },
        include: {
          companies: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              businessSector: true,
              isActive: true,
            },
          },
        },
      });
    } else if (isUsernameFormat(identifier)) {
      // It's a username, search by name (assuming username is stored in name field or we need to add it)
      // For now, we'll search by name as a fallback
      municipality = await prisma.municipality.findFirst({
        where: {
          name: {
            contains: identifier,
            mode: "insensitive",
          },
        },
        include: {
          companies: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              businessSector: true,
              isActive: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Identificador inválido" },
        { status: 400 }
      );
    }

    if (!municipality) {
      return NextResponse.json(
        { error: "Municipio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ municipality });
  } catch (error) {
    console.error("Error fetching municipality by identifier:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
