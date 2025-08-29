import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;
    console.log('📊 API: Received request for enrollment progress:', enrollmentId);
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('📊 API: Authenticated user:', decoded.username);

    // Get enrollment progress from database
    let enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                moduleId: true,
                orderIndex: true,
                duration: true,
              }
            }
          }
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    moduleId: true,
                    orderIndex: true,
                    duration: true,
                    isRequired: true,
                  },
                  orderBy: { orderIndex: 'asc' }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    // If enrollment not found in database, check if it's a mock enrollment ID
    if (!enrollment && enrollmentId.startsWith('enroll_')) {
      console.log('📊 API: Enrollment not found in database, generating mock progress data for:', enrollmentId);
      
      // Return mock progress data
      const mockProgress = {
        enrollmentId: enrollmentId,
        progress: enrollmentId === 'enroll_1' ? 25 : enrollmentId === 'enroll_2' ? 0 : 100,
        status: enrollmentId === 'enroll_1' ? 'IN_PROGRESS' : enrollmentId === 'enroll_2' ? 'ENROLLED' : 'COMPLETED',
        timeSpent: enrollmentId === 'enroll_1' ? 120 : enrollmentId === 'enroll_2' ? 0 : 600,
        currentModuleId: enrollmentId === 'enroll_1' ? 'module_1' : null,
        currentLessonId: enrollmentId === 'enroll_1' ? 'lesson_1' : null,
        completedLessons: enrollmentId === 'enroll_3' ? ['lesson_1', 'lesson_2'] : enrollmentId === 'enroll_1' ? ['lesson_1'] : [],
        lessonProgress: enrollmentId === 'enroll_1' ? [
          {
            id: 'progress_1',
            lessonId: 'lesson_1',
            enrollmentId: enrollmentId,
            status: 'COMPLETED',
            progress: 100,
            timeSpent: 15,
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            lesson: {
              id: 'lesson_1',
              title: 'Lección 1: Primeros pasos',
              moduleId: 'module_1',
              orderIndex: 0,
              duration: 15
            }
          }
        ] : [],
        moduleProgress: {
          'module_1': {
            moduleId: 'module_1',
            completedLessons: enrollmentId === 'enroll_1' ? 1 : 0,
            totalLessons: 3,
            progress: enrollmentId === 'enroll_1' ? 33 : 0,
            timeSpent: enrollmentId === 'enroll_1' ? 15 : 0
          }
        },
        overallStats: {
          totalLessons: 6,
          completedLessons: enrollmentId === 'enroll_1' ? 1 : enrollmentId === 'enroll_3' ? 6 : 0,
          totalDuration: 90,
          timeSpent: enrollmentId === 'enroll_1' ? 15 : enrollmentId === 'enroll_3' ? 90 : 0,
          averageScore: enrollmentId === 'enroll_3' ? 85 : null,
          certificateEarned: enrollmentId === 'enroll_3'
        }
      };
      
      return NextResponse.json(mockProgress, { status: 200 });
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if the authenticated user owns this enrollment
    if (enrollment.studentId !== decoded.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to enrollment progress' },
        { status: 403 }
      );
    }

    // Calculate progress statistics
    const totalLessons = enrollment.course.modules.reduce((total, module) => total + module.lessons.length, 0);
    const completedLessons = enrollment.lessonProgress.filter(lp => lp.status === 'COMPLETED').length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Build module progress
    const moduleProgress: any = {};
    enrollment.course.modules.forEach(module => {
      const moduleLessonProgress = enrollment.lessonProgress.filter(lp => 
        module.lessons.some(lesson => lesson.id === lp.lessonId)
      );
      const moduleCompletedLessons = moduleLessonProgress.filter(lp => lp.status === 'COMPLETED').length;
      const moduleTimeSpent = moduleLessonProgress.reduce((total, lp) => total + (lp.timeSpent || 0), 0);
      
      moduleProgress[module.id] = {
        moduleId: module.id,
        completedLessons: moduleCompletedLessons,
        totalLessons: module.lessons.length,
        progress: module.lessons.length > 0 ? Math.round((moduleCompletedLessons / module.lessons.length) * 100) : 0,
        timeSpent: moduleTimeSpent
      };
    });

    // Build response
    const progressData = {
      enrollmentId: enrollment.id,
      progress: progressPercentage,
      status: enrollment.status,
      timeSpent: enrollment.timeSpent,
      currentModuleId: enrollment.currentModuleId,
      currentLessonId: enrollment.currentLessonId,
      completedLessons: enrollment.lessonProgress.filter(lp => lp.status === 'COMPLETED').map(lp => lp.lessonId),
      lessonProgress: enrollment.lessonProgress,
      moduleProgress: moduleProgress,
      overallStats: {
        totalLessons,
        completedLessons,
        totalDuration: enrollment.course.modules.reduce((total, module) => 
          total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + (lesson.duration || 0), 0), 0
        ),
        timeSpent: enrollment.timeSpent,
        averageScore: null, // TODO: Calculate from quiz results
        certificateEarned: enrollment.status === 'COMPLETED'
      }
    };

    console.log('📊 API: Found enrollment progress:', enrollment.id);
    return NextResponse.json(progressData, { status: 200 });
  } catch (error) {
    console.error('❌ Error in enrollment progress route:', error);
    
    const errorDetails = error instanceof Error ? {
      message: error.message,
      code: (error as any).code,
      meta: (error as any).meta
    } : { message: 'Unknown error' };
    
    console.error('❌ Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorDetails.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const enrollmentId = resolvedParams.id;
    console.log('📊 API: Received request to update enrollment progress:', enrollmentId);
    
    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('📊 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { progress, currentModuleId, currentLessonId, timeSpent } = body;

    // Update enrollment progress
    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: progress,
        currentModuleId: currentModuleId,
        currentLessonId: currentLessonId,
        timeSpent: timeSpent,
        ...(progress === 100 && { 
          status: 'COMPLETED',
          completedAt: new Date()
        })
      }
    });

    console.log('📊 API: Updated enrollment progress:', enrollmentId);
    return NextResponse.json({ enrollment: updatedEnrollment }, { status: 200 });
  } catch (error) {
    console.error('❌ Error updating enrollment progress:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
