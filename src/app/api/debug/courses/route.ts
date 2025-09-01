import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking courses in database');
    
    // Get all courses without any filtering
    const allCourses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        },
        modules: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 DEBUG: Found courses:', allCourses.length);
    console.log('🔍 DEBUG: Course details:', allCourses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      isActive: c.isActive,
      instructorId: c.instructorId,
      instructorRole: c.instructor?.role,
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments
    })));

    // Get course count by status
    const activeCourses = await prisma.course.count({ where: { isActive: true } });
    const inactiveCourses = await prisma.course.count({ where: { isActive: false } });
    const totalCourses = await prisma.course.count();

    return NextResponse.json({
      totalCourses,
      activeCourses,
      inactiveCourses,
      courses: allCourses,
      message: 'Debug information retrieved successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('❌ DEBUG: Error checking courses:', error);
    return NextResponse.json(
      { 
        message: 'Error checking courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
