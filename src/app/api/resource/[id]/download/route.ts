import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// POST /api/resource/[id]/download - Descargar recurso e incrementar contador
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: params.id }
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      );
    }

    // Increment download count
    await prisma.resource.update({
      where: { id: params.id },
      data: {
        downloads: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Return download URL or redirect to external URL
    if (resource.externalUrl) {
      return NextResponse.json({
        success: true,
        downloadUrl: resource.externalUrl,
        message: 'Download URL provided'
      });
    } else if (resource.downloadUrl) {
      return NextResponse.json({
        success: true,
        downloadUrl: resource.downloadUrl,
        message: 'Download URL provided'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'No download URL available for this resource' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing download' },
      { status: 500 }
    );
  }
}

// GET /api/resource/[id]/download - Obtener información de descarga
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

    return NextResponse.json({
      success: true,
      downloadUrl: resource.downloadUrl || resource.externalUrl,
      filename: resource.title,
      filesize: 0, // Not stored in current schema
      format: resource.format
    });

  } catch (error) {
    console.error('Error getting download info:', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving download information' },
      { status: 500 }
    );
  }
}