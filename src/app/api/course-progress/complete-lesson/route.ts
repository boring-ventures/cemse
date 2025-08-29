import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export async function POST(request: NextRequest) {
  try {
    console.log('📚 API: Received lesson completion request');
    
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
    console.log('📚 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { enrollmentId, lessonId, timeSpent, videoProgress } = body;

    console.log('📚 API: Lesson completion data:', {
      enrollmentId,
      lessonId,
      timeSpent,
      videoProgress
    });

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: 'enrollmentId and lessonId are required' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await prisma.profile.findUnique({
      where: { userId: decoded.id }
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                    orderIndex: true,
                    moduleId: true,
                    isRequired: true
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

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if (enrollment.studentId !== userProfile.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to enrollment' },
        { status: 403 }
      );
    }

    // Find the lesson in the course
    let targetLesson: any = null;
    let targetModule: any = null;
    
    for (const module of enrollment.course.modules) {
      const lesson = module.lessons.find((l: any) => l.id === lessonId);
      if (lesson) {
        targetLesson = lesson;
        targetModule = module;
        break;
      }
    }

    if (!targetLesson) {
      return NextResponse.json(
        { error: 'Lesson not found in course' },
        { status: 404 }
      );
    }

    // Create or update lesson progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollmentId,
          lessonId: lessonId
        }
      }
    });

    let lessonProgress;
    if (existingProgress) {
      // Update existing progress
      lessonProgress = await prisma.lessonProgress.update({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollmentId,
            lessonId: lessonId
          }
        },
        data: {
          isCompleted: true,
          timeSpent: Math.max(existingProgress.timeSpent || 0, timeSpent || 0),
          completedAt: new Date(),
          videoProgress: videoProgress || 1.0
        }
      });
    } else {
      // Create new progress
      lessonProgress = await prisma.lessonProgress.create({
        data: {
          enrollmentId: enrollmentId,
          lessonId: lessonId,
          isCompleted: true,
          timeSpent: timeSpent || 0,
          completedAt: new Date(),
          videoProgress: videoProgress || 1.0
        }
      });
    }

    // Calculate overall course progress
    const allLessons = enrollment.course.modules.reduce((acc: any[], module: any) => {
      return acc.concat(module.lessons);
    }, []);

    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollmentId,
        lessonId: { in: allLessons.map((l: any) => l.id) }
      }
    });

    const completedLessons = allProgress.filter(p => p.isCompleted).length;
    const totalLessons = allLessons.length;
    const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update enrollment progress
    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: courseProgress,
        timeSpent: (enrollment.timeSpent || 0) + (timeSpent || 0),
        currentLessonId: lessonId,
        currentModuleId: targetModule.id,
        ...(courseProgress === 100 && {
          status: 'COMPLETED',
          completedAt: new Date()
        })
      }
    });

    // Check if module is completed and generate module certificate
    const moduleProgress = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollmentId,
        lessonId: { in: targetModule.lessons.map((l: any) => l.id) }
      }
    });

    const completedModuleLessons = moduleProgress.filter(p => p.isCompleted).length;
    const totalModuleLessons = targetModule.lessons.length;
    const moduleCompletionRate = totalModuleLessons > 0 ? (completedModuleLessons / totalModuleLessons) : 0;

    // Generate module certificate if module is 100% complete
    if (moduleCompletionRate === 1) {
      const existingModuleCert = await prisma.moduleCertificate.findFirst({
        where: {
          moduleId: targetModule.id,
          studentId: userProfile.userId
        }
      });

      if (!existingModuleCert) {
        const moduleGrade = Math.round(85 + Math.random() * 15); // Random grade between 85-100
        await prisma.moduleCertificate.create({
          data: {
            moduleId: targetModule.id,
            studentId: userProfile.userId,
            certificateUrl: `/certificates/module-${targetModule.id}-${userProfile.userId}.pdf`,
            issuedAt: new Date(),
            grade: moduleGrade,
            completedAt: new Date(),
          }
        });
        
        console.log('🏅 Auto-generated module certificate for:', targetModule.title);
      }
    }

    // Generate course certificate if course is 100% complete
    if (courseProgress === 100) {
      const existingCourseCert = await prisma.certificate.findFirst({
        where: {
          userId: userProfile.userId,
          courseId: enrollment.courseId
        }
      });

      if (!existingCourseCert) {
        const verificationCode = `CERT-${enrollment.courseId.toUpperCase()}-${Date.now()}`;
        await prisma.certificate.create({
          data: {
            userId: userProfile.userId,
            courseId: enrollment.courseId,
            template: 'default',
            issuedAt: new Date(),
            verificationCode,
            digitalSignature: `sha256-${verificationCode.toLowerCase()}`,
            isValid: true,
            url: `/certificates/${verificationCode}.pdf`,
          }
        });
        
        console.log('🏆 Auto-generated course certificate for:', enrollment.course.title);
      }
    }

    // Find next lesson
    let nextLesson = null;
    const currentModuleIndex = enrollment.course.modules.findIndex((m: any) => m.id === targetModule.id);
    const currentLessonIndex = targetModule.lessons.findIndex((l: any) => l.id === lessonId);

    if (currentLessonIndex < targetModule.lessons.length - 1) {
      // Next lesson in same module
      nextLesson = {
        id: targetModule.lessons[currentLessonIndex + 1].id,
        title: targetModule.lessons[currentLessonIndex + 1].title,
        moduleTitle: targetModule.title
      };
    } else if (currentModuleIndex < enrollment.course.modules.length - 1) {
      // First lesson of next module
      const nextModule = enrollment.course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        nextLesson = {
          id: nextModule.lessons[0].id,
          title: nextModule.lessons[0].title,
          moduleTitle: nextModule.title
        };
      }
    }

    console.log('📚 API: Lesson completed successfully:', {
      lessonId,
      courseProgress,
      completedLessons,
      totalLessons,
      nextLesson
    });

    return NextResponse.json({
      success: true,
      lessonProgress,
      courseProgress: {
        progress: courseProgress,
        completedLessons,
        totalLessons
      },
      nextLesson,
      enrollment: updatedEnrollment
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in complete lesson route:', error);
    
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
