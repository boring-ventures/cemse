import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// GET /api/resource/[id] - Obtener un recurso específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id }
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, resource });

  } catch (error) {
    console.error('Error getting resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving resource' },
      { status: 500 }
    );
  }
}

// PUT /api/resource/[id] - Actualizar un recurso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    // Update resource
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, resource });

  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resource/[id] - Eliminar un recurso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id }
    });

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    // Delete resource
    await prisma.resource.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Resource deleted successfully' });

  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting resource' },
      { status: 500 }
    );
  }
}