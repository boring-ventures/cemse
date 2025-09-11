import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-utils";
import { saveUploadedFile, getMimeType } from "@/lib/file-upload";

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
    // Authenticate user
    const user = await authenticateUser(request);

    // Check if user has admin permissions
    if (!["SUPERADMIN", "ADMIN", "TRAINING_CENTERS"].includes(user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a este recurso" },
        { status: 403 }
      );
    }

    // Check content type to handle both JSON and FormData
    const contentType = request.headers.get("content-type") || "";
    let resourceData: any = {};

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with file upload
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const type = formData.get("type") as string;
      const category = formData.get("category") as string;
      const thumbnail = formData.get("thumbnail") as string;
      const tags = formData.get("tags") as string;
      const featured = formData.get("featured") as string;
      const status = formData.get("status") as string;
      const author = formData.get("author") as string;

      // Handle file upload if present
      let fileUrl = null;
      if (file) {
        try {
          fileUrl = await saveUploadedFile(file, "resources");
        } catch (error) {
          console.error("File upload failed:", error);
          return NextResponse.json(
            { error: "Error al subir el archivo" },
            { status: 500 }
          );
        }
      }

      resourceData = {
        title,
        description,
        type: type?.toUpperCase() || "TEMPLATE",
        category: category || "General",
        format: file ? getMimeType(file.name) : "URL",
        author: author || user.username || "Administrador",
        downloadUrl: fileUrl || null,
        externalUrl: null,
        thumbnail: thumbnail || "/images/resources/default.jpg",
        publishedDate: new Date(),
        tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
        downloads: 0,
        rating: 0,
      };
    } else {
      // Handle JSON data
      const data = await request.json();

      resourceData = {
        title: data.title,
        description: data.description,
        type: data.type?.toUpperCase() || "TEMPLATE",
        category: data.category || "General",
        format: "URL",
        author: data.author || user.username || "Administrador",
        downloadUrl: data.fileUrl || null,
        externalUrl: data.fileUrl || null,
        thumbnail: data.thumbnail || "/images/resources/default.jpg",
        publishedDate: new Date(),
        tags: data.tags || [],
        downloads: 0,
        rating: 0,
      };
    }

    // Validate required fields
    if (
      !resourceData.title ||
      !resourceData.description ||
      !resourceData.type
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: título, descripción, tipo" },
        { status: 400 }
      );
    }

    // Create resource in database
    const newResource = await prisma.resource.create({
      data: resourceData,
    });

    // Transform the response to match the expected format
    const transformedResource = {
      id: newResource.id,
      title: newResource.title,
      description: newResource.description || "",
      type: newResource.type?.toLowerCase() || "template",
      thumbnail: newResource.thumbnail || "/api/placeholder/300/200",
      category: newResource.category || "General",
      downloads: newResource.downloads || 0,
      rating: newResource.rating || 0,
      author: newResource.author || "Sistema CEMSE",
      fileUrl: newResource.downloadUrl || newResource.externalUrl || "",
      fileSize: newResource.format || "N/A",
      tags: newResource.tags || [],
      status: "published",
      featured: false,
      createdAt: newResource.createdAt,
      updatedAt: newResource.updatedAt || newResource.createdAt,
    };

    return NextResponse.json(transformedResource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Error al crear recurso" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/entrepreneurship/resources/[id] - Update resource
export async function PUT(request: NextRequest) {
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

    // Get resource ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del recurso es requerido" },
        { status: 400 }
      );
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Recurso no encontrado" },
        { status: 404 }
      );
    }

    // Check content type to handle both JSON and FormData
    const contentType = request.headers.get("content-type") || "";
    let resourceData: any = {};

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with file upload
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const type = formData.get("type") as string;
      const category = formData.get("category") as string;
      const thumbnail = formData.get("thumbnail") as string;
      const tags = formData.get("tags") as string;
      const featured = formData.get("featured") as string;
      const status = formData.get("status") as string;
      const author = formData.get("author") as string;

      // Handle file upload if present
      let fileUrl = existingResource.downloadUrl; // Keep existing file if no new file
      if (file) {
        try {
          fileUrl = await saveUploadedFile(file, "resources");
        } catch (error) {
          console.error("File upload failed:", error);
          return NextResponse.json(
            { error: "Error al subir el archivo" },
            { status: 500 }
          );
        }
      }

      resourceData = {
        title,
        description,
        type: type?.toUpperCase() || existingResource.type,
        category: category || existingResource.category,
        format: file ? getMimeType(file.name) : existingResource.format,
        author: author || existingResource.author,
        downloadUrl: fileUrl,
        externalUrl: null,
        thumbnail: thumbnail || existingResource.thumbnail,
        tags: tags
          ? tags.split(",").map((t: string) => t.trim())
          : existingResource.tags,
        updatedAt: new Date(),
      };
    } else {
      // Handle JSON data
      const data = await request.json();

      resourceData = {
        title: data.title || existingResource.title,
        description: data.description || existingResource.description,
        type: data.type?.toUpperCase() || existingResource.type,
        category: data.category || existingResource.category,
        format: existingResource.format,
        author: data.author || existingResource.author,
        downloadUrl: data.fileUrl || existingResource.downloadUrl,
        externalUrl: data.fileUrl || existingResource.externalUrl,
        thumbnail: data.thumbnail || existingResource.thumbnail,
        tags: data.tags || existingResource.tags,
        updatedAt: new Date(),
      };
    }

    // Update resource in database
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: resourceData,
    });

    // Transform the response to match the expected format
    const transformedResource = {
      id: updatedResource.id,
      title: updatedResource.title,
      description: updatedResource.description || "",
      type: updatedResource.type?.toLowerCase() || "template",
      thumbnail: updatedResource.thumbnail || "/api/placeholder/300/200",
      category: updatedResource.category || "General",
      downloads: updatedResource.downloads || 0,
      rating: updatedResource.rating || 0,
      author: updatedResource.author || "Sistema CEMSE",
      fileUrl: updatedResource.downloadUrl || updatedResource.externalUrl || "",
      fileSize: updatedResource.format || "N/A",
      tags: updatedResource.tags || [],
      status: "published",
      featured: false,
      createdAt: updatedResource.createdAt,
      updatedAt: updatedResource.updatedAt || updatedResource.createdAt,
    };

    return NextResponse.json(transformedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Error al actualizar recurso" },
      { status: 500 }
    );
  }
}
