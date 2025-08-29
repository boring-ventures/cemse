import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('📚 API: Received request for course modules');
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('id');
    
    if (moduleId) {
      // Get single module
      const module = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            }
          },
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              orderIndex: true,
            }
          }
        }
      });
      
      if (!module) {
        return NextResponse.json(
          { message: 'Module not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ module }, { status: 200 });
    }
    
    if (courseId) {
      // Get modules for a course
      const modules = await prisma.courseModule.findMany({
        where: { courseId },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              contentType: true,
              duration: true,
              orderIndex: true,
            }
          },
          _count: {
            select: {
              lessons: true,
            }
          }
        },
        orderBy: { orderIndex: 'asc' }
      });
      
      const transformedModules = modules.map(module => ({
        id: module.id,
        courseId: module.courseId,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        estimatedDuration: module.estimatedDuration || 0,
        isLocked: module.isLocked || false,
        prerequisites: module.prerequisites || [],
        hasCertificate: module.hasCertificate || false,
        certificateTemplate: module.certificateTemplate,
        lessons: module.lessons,
        lessonCount: module._count.lessons,
      }));
      
      return NextResponse.json({ modules: transformedModules }, { status: 200 });
    }
    
    // Get all modules (admin only)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const modules = await prisma.courseModule.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        },
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            orderIndex: true,
          }
        },
        _count: {
          select: {
            lessons: true,
          }
        }
      },
      orderBy: [
        { courseId: 'asc' },
        { orderIndex: 'asc' }
      ]
    });
    
    return NextResponse.json({ modules }, { status: 200 });
  } catch (error) {
    console.error('❌ Error in course modules route:', error);
    
    const errorDetails = error instanceof Error ? {
      message: error.message,
      code: (error as any).code,
      meta: (error as any).meta
    } : { message: 'Unknown error' };
    
    console.error('❌ Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📚 API: Received POST request for module creation');
    
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
    
    // Create module in database
    const module = await prisma.courseModule.create({
      data: {
        courseId: body.courseId,
        title: body.title,
        description: body.description,
        orderIndex: body.orderIndex || 0,
        estimatedDuration: body.estimatedDuration || 0,
        isLocked: body.isLocked || false,
        prerequisites: body.prerequisites || [],
        hasCertificate: body.hasCertificate || false,
        certificateTemplate: body.certificateTemplate,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        },
        lessons: {
          orderBy: { orderIndex: 'asc' },
        }
      }
    });

    console.log('✅ Module created successfully:', module.id);
    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating module:', error);
    
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

export async function PUT(request: NextRequest) {
  try {
    console.log('📚 API: Received PUT request for module update');
    
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
        { message: 'Module ID is required' },
        { status: 400 }
      );
    }
    
    // Update module in database
    const module = await prisma.courseModule.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        },
        lessons: {
          orderBy: { orderIndex: 'asc' },
        }
      }
    });

    console.log('✅ Module updated successfully:', module.id);
    return NextResponse.json({ module }, { status: 200 });
  } catch (error) {
    console.error('❌ Error updating module:', error);
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
    console.log('📚 API: Received DELETE request for module');
    
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
    const moduleId = searchParams.get('id');
    
    if (!moduleId) {
      return NextResponse.json(
        { message: 'Module ID is required' },
        { status: 400 }
      );
    }
    
    // Delete module from database
    await prisma.courseModule.delete({
      where: { id: moduleId }
    });

    console.log('✅ Module deleted successfully:', moduleId);
    return NextResponse.json({ message: 'Module deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error deleting module:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
