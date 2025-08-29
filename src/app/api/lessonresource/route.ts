import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('📚 API: Received request for lesson resources');
    
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const resourceId = searchParams.get('id');
    
    if (resourceId) {
      // Get single resource
      const resource = await prisma.lessonResource.findUnique({
        where: { id: resourceId },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              moduleId: true,
            }
          }
        }
      });
      
      if (!resource) {
        return NextResponse.json(
          { message: 'Resource not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ resource }, { status: 200 });
    }
    
    if (lessonId) {
      // Get resources for a lesson
      const resources = await prisma.lessonResource.findMany({
        where: { lessonId },
        orderBy: { orderIndex: 'asc' }
      });
      
      const transformedResources = resources.map(resource => ({
        id: resource.id,
        lessonId: resource.lessonId,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url,
        filePath: resource.filePath,
        fileSize: resource.fileSize,
        orderIndex: resource.orderIndex,
        isDownloadable: resource.isDownloadable,
        createdAt: resource.createdAt,
      }));
      
      return NextResponse.json({ resources: transformedResources }, { status: 200 });
    }
    
    // Get all resources (admin only)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const resources = await prisma.lessonResource.findMany({
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          }
        }
      },
      orderBy: [
        { lessonId: 'asc' },
        { orderIndex: 'asc' }
      ]
    });
    
    return NextResponse.json({ resources }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in lesson resources route:', error);
    
    const errorDetails = error instanceof Error ? {
      message: error.message,
      code: (error as any).code,
      meta: (error as any).meta
    } : { message: 'Unknown error' };
    
    console.error('❌ Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📚 API: Received POST request for resource creation');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('📚 API: Authenticated user:', decoded.username);

    const body = await request.json();
    
    // Create resource in database
    const resource = await prisma.lessonResource.create({
      data: {
        lessonId: body.lessonId,
        title: body.title,
        description: body.description,
        type: body.type || 'OTHER',
        url: body.url || '',
        filePath: body.filePath,
        fileSize: body.fileSize || 0,
        orderIndex: body.orderIndex || 0,
        isDownloadable: body.isDownloadable !== undefined ? body.isDownloadable : true,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          }
        }
      }
    });

    console.log('✅ Resource created successfully:', resource.id);
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating resource:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📚 API: Received PUT request for resource update');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('📚 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    // Update resource in database
    const resource = await prisma.lessonResource.update({
      where: { id },
      data: updateData,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true,
          }
        }
      }
    });

    console.log('✅ Resource updated successfully:', resource.id);
    return NextResponse.json({ resource }, { status: 200 });
  } catch (error) {
    console.error('❌ Error updating resource:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📚 API: Received DELETE request for resource');
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('📚 API: Authenticated user:', decoded.username);

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');
    
    if (!resourceId) {
      return NextResponse.json(
        { message: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    // Delete resource from database
    await prisma.lessonResource.delete({
      where: { id: resourceId }
    });

    console.log('✅ Resource deleted successfully:', resourceId);
    return NextResponse.json({ message: 'Resource deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error deleting resource:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
