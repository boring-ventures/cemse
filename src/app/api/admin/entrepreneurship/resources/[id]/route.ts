import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth-utils";

// PUT /api/admin/entrepreneurship/resources/[id] - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const data = await request.json();

    // Find the resource
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Recurso no encontrado" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.category) updateData.category = data.category;
    if (data.fileUrl) updateData.downloadUrl = data.fileUrl;
    if (data.author) updateData.author = data.author;
    if (data.tags) updateData.tags = data.tags;
    if (data.thumbnail) updateData.thumbnail = data.thumbnail;

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    // Transform the response to match frontend format
    const transformedResource = {
      id: updatedResource.id,
      title: updatedResource.title,
      description: updatedResource.description || "",
      type: updatedResource.type || "template",
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

    return NextResponse.json({
      message: "Recurso actualizado exitosamente",
      resource: transformedResource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Error al actualizar recurso" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/entrepreneurship/resources/[id] - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Find the resource first to return it in response
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Recurso no encontrado" },
        { status: 404 }
      );
    }

    // Delete the resource
    await prisma.resource.delete({
      where: { id },
    });

    // Transform the response to match frontend format
    const transformedResource = {
      id: existingResource.id,
      title: existingResource.title,
      description: existingResource.description || "",
      type: existingResource.type || "template",
      thumbnail: existingResource.thumbnail || "/api/placeholder/300/200",
      category: existingResource.category || "General",
      downloads: existingResource.downloads || 0,
      rating: existingResource.rating || 0,
      author: existingResource.author || "Sistema CEMSE",
      fileUrl:
        existingResource.downloadUrl || existingResource.externalUrl || "",
      fileSize: existingResource.format || "N/A",
      tags: existingResource.tags || [],
      status: "published",
      featured: false,
      createdAt: existingResource.createdAt,
      updatedAt: existingResource.updatedAt || existingResource.createdAt,
    };

    return NextResponse.json({
      message: "Recurso eliminado exitosamente",
      resource: transformedResource,
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Error al eliminar recurso" },
      { status: 500 }
    );
  }
}
