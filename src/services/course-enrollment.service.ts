import { prisma } from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";

export interface EnrollmentData {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  status: EnrollmentStatus;
  progress: number;
  currentModuleId?: string | null;
  currentLessonId?: string | null;
  certificateUrl?: string | null;
  timeSpent: number;
  certificateIssued: boolean;
  finalGrade?: number | null;
  moduleProgress?: any;
  quizResults?: any;
}

export interface EnrollmentWithCourse extends EnrollmentData {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    level: string;
    duration: number;
    category: string;
    isActive: boolean;
    instructor?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DetailedEnrollment extends EnrollmentWithCourse {
  course: EnrollmentWithCourse["course"] & {
    modules: Array<{
      id: string;
      title: string;
      description: string | null;
      orderIndex: number;
      estimatedDuration: number;
      isLocked: boolean;
      lessons: Array<{
        id: string;
        title: string;
        description: string | null;
        content: string;
        contentType: string;
        videoUrl: string | null;
        duration: number | null;
        orderIndex: number;
        isRequired: boolean;
        isPreview: boolean;
        resources?: Array<{
          id: string;
          title: string;
          description: string | null;
          type: string;
          url: string;
          orderIndex: number;
          isDownloadable: boolean;
        }>;
        quizzes?: Array<{
          id: string;
          title: string;
          description: string | null;
          timeLimit: number | null;
          passingScore: number;
          showCorrectAnswers: boolean;
          questions: Array<{
            id: string;
            type: string;
            question: string;
            orderIndex: number;
            points: number;
            options?: Array<{
              id: string;
              text: string;
              isCorrect: boolean;
              orderIndex: number;
            }>;
          }>;
        }>;
      }>;
    }>;
  };
  lessonProgress: Array<{
    id: string;
    lessonId: string;
    isCompleted: boolean;
    completedAt: Date | null;
    timeSpent: number;
    videoProgress: number;
    lastWatchedAt: Date | null;
  }>;
}

export class CourseEnrollmentService {
  /**
   * Get all enrollments for a user
   */
  static async getUserEnrollments(
    userId: string
  ): Promise<EnrollmentWithCourse[]> {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            category: true,
            isActive: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      status: enrollment.status,
      progress: Number(enrollment.progress),
      currentModuleId: enrollment.currentModuleId,
      currentLessonId: enrollment.currentLessonId,
      certificateUrl: enrollment.certificateUrl,
      timeSpent: enrollment.timeSpent,
      certificateIssued: enrollment.certificateIssued,
      finalGrade: enrollment.finalGrade,
      moduleProgress: enrollment.moduleProgress,
      quizResults: enrollment.quizResults,
      course: enrollment.course,
      student: enrollment.student,
    }));
  }

  /**
   * Get a specific enrollment by ID
   */
  static async getEnrollmentById(
    enrollmentId: string
  ): Promise<EnrollmentWithCourse | null> {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            category: true,
            isActive: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) return null;

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      status: enrollment.status,
      progress: Number(enrollment.progress),
      currentModuleId: enrollment.currentModuleId,
      currentLessonId: enrollment.currentLessonId,
      certificateUrl: enrollment.certificateUrl,
      timeSpent: enrollment.timeSpent,
      certificateIssued: enrollment.certificateIssued,
      finalGrade: enrollment.finalGrade,
      moduleProgress: enrollment.moduleProgress,
      quizResults: enrollment.quizResults,
      course: enrollment.course,
      student: enrollment.student,
    };
  }

  /**
   * Get detailed enrollment data for learning
   */
  static async getDetailedEnrollment(
    enrollmentId: string
  ): Promise<DetailedEnrollment | null> {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    resources: {
                      orderBy: { orderIndex: "asc" },
                    },
                    quizzes: {
                      include: {
                        questions: {
                          include: {
                            options: {
                              orderBy: { orderIndex: "asc" },
                            },
                          },
                          orderBy: { orderIndex: "asc" },
                        },
                      },
                    },
                  },
                  orderBy: { orderIndex: "asc" },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) return null;

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      status: enrollment.status,
      progress: Number(enrollment.progress),
      currentModuleId: enrollment.currentModuleId,
      currentLessonId: enrollment.currentLessonId,
      certificateUrl: enrollment.certificateUrl,
      timeSpent: enrollment.timeSpent,
      certificateIssued: enrollment.certificateIssued,
      finalGrade: enrollment.finalGrade,
      moduleProgress: enrollment.moduleProgress,
      quizResults: enrollment.quizResults,
      course: enrollment.course,
      student: enrollment.student,
      lessonProgress: enrollment.lessonProgress,
    };
  }

  /**
   * Create a new course enrollment
   */
  static async createEnrollment(
    userId: string,
    courseId: string
  ): Promise<EnrollmentWithCourse> {
    // Check if user is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: userId,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      throw new Error("User is already enrolled in this course");
    }

    // Verify course exists and is active
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isActive: true,
      },
    });

    if (!course) {
      throw new Error("Course not found or not active");
    }

    // Create the enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: userId,
        courseId: courseId,
        enrolledAt: new Date(),
        status: "ENROLLED",
        progress: 0,
        timeSpent: 0,
        certificateIssued: false,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            category: true,
            isActive: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      status: enrollment.status,
      progress: Number(enrollment.progress),
      currentModuleId: enrollment.currentModuleId,
      currentLessonId: enrollment.currentLessonId,
      certificateUrl: enrollment.certificateUrl,
      timeSpent: enrollment.timeSpent,
      certificateIssued: enrollment.certificateIssued,
      finalGrade: enrollment.finalGrade,
      moduleProgress: enrollment.moduleProgress,
      quizResults: enrollment.quizResults,
      course: enrollment.course,
      student: enrollment.student,
    };
  }

  /**
   * Update enrollment progress
   */
  static async updateProgress(
    enrollmentId: string,
    progressData: {
      progress?: number;
      status?: EnrollmentStatus;
      currentModuleId?: string;
      currentLessonId?: string;
      timeSpent?: number;
      moduleProgress?: any;
      quizResults?: any;
      startedAt?: Date;
      completedAt?: Date;
    }
  ): Promise<EnrollmentWithCourse> {
    const enrollment = await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        ...progressData,
        ...(progressData.startedAt && { startedAt: progressData.startedAt }),
        ...(progressData.completedAt && {
          completedAt: progressData.completedAt,
        }),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            category: true,
            isActive: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      status: enrollment.status,
      progress: Number(enrollment.progress),
      currentModuleId: enrollment.currentModuleId,
      currentLessonId: enrollment.currentLessonId,
      certificateUrl: enrollment.certificateUrl,
      timeSpent: enrollment.timeSpent,
      certificateIssued: enrollment.certificateIssued,
      finalGrade: enrollment.finalGrade,
      moduleProgress: enrollment.moduleProgress,
      quizResults: enrollment.quizResults,
      course: enrollment.course,
      student: enrollment.student,
    };
  }

  /**
   * Calculate overall progress based on lesson progress
   */
  static async calculateProgress(enrollmentId: string): Promise<number> {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: { id: true, isRequired: true },
                  orderBy: { orderIndex: "asc" },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) return 0;

    // Get all required lessons
    const requiredLessons = enrollment.course.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => lesson.isRequired);

    if (requiredLessons.length === 0) return 0;

    // Count completed required lessons
    const completedLessons = enrollment.lessonProgress.filter(
      (progress) =>
        progress.isCompleted &&
        requiredLessons.some((lesson) => lesson.id === progress.lessonId)
    );

    const progressPercentage =
      (completedLessons.length / requiredLessons.length) * 100;

    // Update the enrollment progress
    await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: progressPercentage,
        status:
          progressPercentage === 100
            ? "COMPLETED"
            : progressPercentage > 0
              ? "IN_PROGRESS"
              : "ENROLLED",
        ...(progressPercentage === 100 && { completedAt: new Date() }),
        ...(progressPercentage > 0 &&
          !enrollment.startedAt && { startedAt: new Date() }),
      },
    });

    return progressPercentage;
  }

  /**
   * Check if user owns the enrollment
   */
  static async verifyOwnership(
    enrollmentId: string,
    userId: string
  ): Promise<boolean> {
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId: userId,
      },
    });

    return !!enrollment;
  }
}
