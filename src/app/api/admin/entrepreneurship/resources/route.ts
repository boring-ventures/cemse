import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-utils";

// GET /api/admin/entrepreneurship/resources - List and filter resources
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    // Check if user has admin permissions
    if (!["SUPERADMIN", "ADMIN", "TRAINING_CENTERS"].includes(user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a este recurso" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    // Get resources from database using Resource model
    const resources = await prisma.resource.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Get total count for pagination
    const total = await prisma.resource.count({ where });

    // Transform the data to match the expected format
    const transformedResources = resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description || "",
      type: resource.type || "template",
      thumbnail: resource.thumbnail || "/api/placeholder/300/200",
      category: resource.category || "General",
      downloads: resource.downloads || 0,
      rating: resource.rating || 0,
      author: resource.author || "Sistema CEMSE",
      fileUrl: resource.downloadUrl || resource.externalUrl || "",
      fileSize: resource.format || "N/A",
      tags: resource.tags || [],
      status: "published", // Default status
      featured: false, // Not available in current schema
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt || resource.createdAt,
    }));

    // Calculate statistics
    const stats = {
      total: total,
      byType: {
        template: await prisma.resource.count({ where: { type: "template" } }),
        guide: await prisma.resource.count({ where: { type: "guide" } }),
        video: await prisma.resource.count({ where: { type: "video" } }),
        podcast: await prisma.resource.count({ where: { type: "podcast" } }),
        tool: await prisma.resource.count({ where: { type: "tool" } }),
      },
      byStatus: {
        published: total, // All resources are considered published
        draft: 0,
        archived: 0,
      },
      featured: 0, // Not available in current schema
    };

    return NextResponse.json({
      resources: transformedResources,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Error al obtener recursos" },
      { status: 500 }
    );
  }
}

// POST /api/admin/entrepreneurship/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.type) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Create new resource
    const newResource = {
      id: `resource-${Date.now()}`,
      title: data.title,
      description: data.description,
      type: data.type,
      thumbnail: data.thumbnail || "/api/placeholder/300/200",
      category: data.category || "General",
      downloads: 0,
      rating: 0,
      author: data.author || "Sistema CEMSE",
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      tags: data.tags || [],
      status: data.status || "draft",
      featured: data.featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Error al crear recurso" },
      { status: 500 }
    );
  }
}
