import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/lib/api";

// DEPRECATED: Use useEnrollments hook instead
// This hook is kept for backward compatibility

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED" | "SUSPENDED";
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    duration: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    category: string;
    instructor?: {
      id: string;
      name: string;
      avatar?: string;
    } | null;
    organization?: {
      id: string;
      name: string;
    } | null;
    totalLessons: number;
    totalQuizzes: number;
    isActive: boolean;
    studentCount?: number;
    rating?: number;
  };
}

export const useCourseEnrollments = () => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 useCourseEnrollments: Fetching enrollments...");
      // Try new API first, fallback to old API
      try {
        const data = await apiCall("/enrollments");
        console.log(
          "🔍 useCourseEnrollments: Response received from new API:",
          data
        );
        setEnrollments(data.enrollments || []);
      } catch (err) {
        console.log("🔍 useCourseEnrollments: Falling back to old API");
        const data = await apiCall("/course-enrollments");
        console.log(
          "🔍 useCourseEnrollments: Response received from old API:",
          data
        );
        setEnrollments(data.enrollments || data || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar inscripciones"
      );
      console.error("Error fetching enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      // Try new API first, fallback to old API
      let data;
      try {
        data = await apiCall("/enrollments", {
          method: "POST",
          body: JSON.stringify({ courseId }),
        });
      } catch (err) {
        console.log(
          "🔍 useCourseEnrollments: Falling back to old enrollment API"
        );
        data = await apiCall("/course-enrollments", {
          method: "POST",
          body: JSON.stringify({ courseId }),
        });
      }

      // Actualizar la lista de inscripciones
      await fetchEnrollments();

      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Error al inscribirse en el curso");
    }
  };

  const updateProgress = async (enrollmentId: string, progress: number) => {
    try {
      const data = await apiCall(`/course-enrollments/${enrollmentId}`, {
        method: "PUT",
        body: JSON.stringify({ progress }),
      });

      // Actualizar la lista de inscripciones
      await fetchEnrollments();

      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Error al actualizar progreso");
    }
  };

  const updateEnrollmentProgress = async (
    enrollmentId: string,
    progressData: any
  ) => {
    try {
      const data = await apiCall(`/course-enrollments/${enrollmentId}`, {
        method: "PUT",
        body: JSON.stringify(progressData),
      });

      // Actualizar la lista de inscripciones
      await fetchEnrollments();

      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Error al actualizar progreso de inscripción");
    }
  };

  const completeCourse = async (enrollmentId: string) => {
    try {
      const data = await apiCall(`/course-enrollments/${enrollmentId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "COMPLETED",
          progress: 100,
          completedAt: new Date().toISOString(),
        }),
      });

      // Actualizar la lista de inscripciones
      await fetchEnrollments();

      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Error al completar el curso");
    }
  };

  const dropCourse = async (enrollmentId: string) => {
    try {
      const data = await apiCall(`/course-enrollments/${enrollmentId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "DROPPED",
        }),
      });

      // Actualizar la lista de inscripciones
      await fetchEnrollments();

      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Error al abandonar el curso");
    }
  };

  const getEnrollmentById = useCallback(
    async (enrollmentId: string): Promise<CourseEnrollment | null> => {
      try {
        console.log(
          "🔍 useCourseEnrollments: Fetching enrollment with ID:",
          enrollmentId
        );

        // Solicitar datos completos incluyendo resources y quizzes
        const data = await apiCall(
          `/course-enrollments/${enrollmentId}?include=course.modules.lessons.resources,course.modules.lessons.quizzes`
        );

        console.log("🔍 useCourseEnrollments: Enrollment data received:", data);
        return data.enrollment || data;
      } catch (err) {
        console.error("Error fetching enrollment by ID:", err);
        return null;
      }
    },
    []
  );

  // Solo cargar enrollments automáticamente para la página de "Mis Cursos"
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const getEnrollmentForLearning = useCallback(
    async (enrollmentId: string): Promise<any | null> => {
      try {
        console.log(
          "🔍 useCourseEnrollments: Fetching enrollment for learning with ID:",
          enrollmentId
        );

        // Intentar varios endpoints posibles
        const endpoints = [
          `/course-enrollments/${enrollmentId}/learning`, // Endpoint específico para aprendizaje
          `/course-enrollments/${enrollmentId}?include=resources,quizzes`, // Con parámetro include
          `/course-enrollments/${enrollmentId}/full`, // Endpoint full
          `/course-enrollments/${enrollmentId}`, // Endpoint normal como fallback
        ];

        for (const endpoint of endpoints) {
          try {
            console.log(`🔍 Trying endpoint: ${endpoint}`);
            const data = await apiCall(endpoint);
            console.log(`🔍 Response from ${endpoint}:`, data);

            // Verificar si la respuesta incluye course data
            const enrollment = data.enrollment || data;
            const hasCourseData = !!enrollment?.course;
            const hasModules = enrollment?.course?.modules?.length > 0;
            const hasLessons = enrollment?.course?.modules?.some(
              (module: any) => module.lessons && module.lessons.length > 0
            );

            console.log("🔍 Checking enrollment data:", {
              hasCourse: hasCourseData,
              hasModules: hasModules,
              modulesCount: enrollment?.course?.modules?.length || 0,
              hasLessons: hasLessons,
              courseTitle: enrollment?.course?.title || "No title",
              modules:
                enrollment?.course?.modules?.map((m: any) => ({
                  id: m.id,
                  title: m.title,
                  lessonsCount: m.lessons?.length || 0,
                })) || [],
            });

            // Accept any course data - we'll handle empty modules/lessons in the UI
            if (hasCourseData) {
              console.log("✅ Found enrollment with course data");
              return enrollment;
            } else {
              console.log("⚠️ No course data found in enrollment response");
            }
          } catch (err) {
            console.log(`❌ Endpoint ${endpoint} failed:`, err);
            continue;
          }
        }

        console.warn("⚠️ No endpoint returned course data");
        return null;
      } catch (err) {
        console.error("Error fetching enrollment for learning:", err);
        return null;
      }
    },
    []
  );

  return {
    enrollments,
    loading,
    error,
    fetchEnrollments,
    enrollInCourse,
    updateProgress,
    updateEnrollmentProgress,
    completeCourse,
    dropCourse,
    getEnrollmentById,
    getEnrollmentForLearning,
  };
};
