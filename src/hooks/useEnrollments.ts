import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";

export interface EnrollmentCourse {
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
}

export interface EnrollmentStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED" | "SUSPENDED";
  progress: number;
  currentModuleId?: string | null;
  currentLessonId?: string | null;
  certificateUrl?: string | null;
  timeSpent: number;
  certificateIssued: boolean;
  finalGrade?: number | null;
  moduleProgress?: any;
  quizResults?: any;
  course: EnrollmentCourse;
  student: EnrollmentStudent;
}

export interface DetailedModule {
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
}

export interface DetailedEnrollment extends Enrollment {
  course: EnrollmentCourse & {
    modules: DetailedModule[];
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

export interface LessonProgress {
  id: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  timeSpent: number;
  videoProgress: number;
  lastWatchedAt: Date | null;
  lesson: {
    id: string;
    title: string;
    moduleId: string;
    orderIndex: number;
    isRequired: boolean;
  };
}

export interface ProgressResponse {
  enrollment: Enrollment;
  lessonProgress: LessonProgress[];
}

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 useEnrollments: Fetching enrollments...");

      // Use the working API endpoint directly
      const response = await apiCall("/course-enrollments");
      console.log("🔍 useEnrollments: Response received:", response);

      setEnrollments(response.enrollments || []);
      return response.enrollments || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar inscripciones";
      setError(errorMessage);
      console.error("❌ useEnrollments: Error fetching enrollments:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enrollInCourse = useCallback(
    async (courseId: string): Promise<Enrollment> => {
      try {
        console.log("🔍 useEnrollments: Enrolling in course:", courseId);

        const enrollment = await apiCall("/enrollments", {
          method: "POST",
          body: JSON.stringify({ courseId }),
        });

        console.log("✅ useEnrollments: Successfully enrolled:", enrollment);

        // Refresh enrollments list
        await fetchEnrollments();

        return enrollment;
      } catch (err) {
        console.error("❌ useEnrollments: Error enrolling in course:", err);
        throw err instanceof Error
          ? err
          : new Error("Error al inscribirse en el curso");
      }
    },
    [fetchEnrollments]
  );

  const getEnrollmentById = useCallback(
    async (enrollmentId: string): Promise<Enrollment | null> => {
      try {
        console.log("🔍 useEnrollments: Fetching enrollment:", enrollmentId);

        const response = await apiCall(`/enrollments/${enrollmentId}`);

        console.log(
          "🔍 useEnrollments: Enrollment fetched:",
          response.enrollment
        );
        return response.enrollment;
      } catch (err) {
        console.error("❌ useEnrollments: Error fetching enrollment:", err);
        return null;
      }
    },
    []
  );

  const getDetailedEnrollment = useCallback(
    async (enrollmentId: string): Promise<DetailedEnrollment | null> => {
      try {
        console.log(
          "🔍 useEnrollments: Fetching detailed enrollment:",
          enrollmentId
        );

        const response = await apiCall(
          `/enrollments/${enrollmentId}?detailed=true`
        );

        console.log(
          "🔍 useEnrollments: Detailed enrollment fetched:",
          response.enrollment
        );
        return response.enrollment;
      } catch (err) {
        console.error(
          "❌ useEnrollments: Error fetching detailed enrollment:",
          err
        );
        return null;
      }
    },
    []
  );

  const updateEnrollmentProgress = useCallback(
    async (
      enrollmentId: string,
      progressData: {
        progress?: number;
        status?:
          | "ENROLLED"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "DROPPED"
          | "SUSPENDED";
        currentModuleId?: string;
        currentLessonId?: string;
        timeSpent?: number;
        moduleProgress?: any;
        quizResults?: any;
      }
    ): Promise<Enrollment> => {
      try {
        console.log(
          "🔍 useEnrollments: Updating enrollment progress:",
          enrollmentId,
          progressData
        );

        const response = await apiCall(`/enrollments/${enrollmentId}`, {
          method: "PUT",
          body: JSON.stringify(progressData),
        });

        console.log(
          "✅ useEnrollments: Progress updated:",
          response.enrollment
        );

        // Update local state
        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.id === enrollmentId ? response.enrollment : enrollment
          )
        );

        return response.enrollment;
      } catch (err) {
        console.error("❌ useEnrollments: Error updating progress:", err);
        throw err instanceof Error
          ? err
          : new Error("Error al actualizar progreso");
      }
    },
    []
  );

  const updateLessonProgress = useCallback(
    async (
      enrollmentId: string,
      lessonData: {
        lessonId: string;
        isCompleted?: boolean;
        timeSpent?: number;
        videoProgress?: number;
      }
    ): Promise<{ lessonProgress: any; overallProgress: number }> => {
      try {
        console.log(
          "🔍 useEnrollments: Updating lesson progress:",
          enrollmentId,
          lessonData
        );

        const response = await apiCall(
          `/enrollments/${enrollmentId}/progress`,
          {
            method: "POST",
            body: JSON.stringify(lessonData),
          }
        );

        console.log("✅ useEnrollments: Lesson progress updated:", response);

        // Refresh enrollments to get updated overall progress
        await fetchEnrollments();

        return response;
      } catch (err) {
        console.error(
          "❌ useEnrollments: Error updating lesson progress:",
          err
        );
        throw err instanceof Error
          ? err
          : new Error("Error al actualizar progreso de lección");
      }
    },
    [fetchEnrollments]
  );

  const getEnrollmentProgress = useCallback(
    async (enrollmentId: string): Promise<ProgressResponse> => {
      try {
        console.log(
          "🔍 useEnrollments: Fetching enrollment progress:",
          enrollmentId
        );

        const response = await apiCall(`/enrollments/${enrollmentId}/progress`);

        console.log("🔍 useEnrollments: Progress fetched:", response);
        return response;
      } catch (err) {
        console.error("❌ useEnrollments: Error fetching progress:", err);
        throw err instanceof Error
          ? err
          : new Error("Error al obtener progreso");
      }
    },
    []
  );

  // Helper function to check if user is enrolled in a course
  const isEnrolledInCourse = useCallback(
    (courseId: string): Enrollment | undefined => {
      return enrollments.find((enrollment) => enrollment.courseId === courseId);
    },
    [enrollments]
  );

  // Auto-fetch enrollments on mount
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    // State
    enrollments,
    loading,
    error,

    // Actions
    fetchEnrollments,
    enrollInCourse,
    getEnrollmentById,
    getDetailedEnrollment,
    updateEnrollmentProgress,
    updateLessonProgress,
    getEnrollmentProgress,
    isEnrolledInCourse,
  };
};
