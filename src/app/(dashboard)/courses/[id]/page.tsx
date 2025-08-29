"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CourseDetail } from "@/components/courses/course-detail";
import { Course } from "@/types/api";
import { apiCall } from "@/lib/api";
import { useEnrollments } from "@/hooks/useEnrollments";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;

  // Check for error messages
  const errorParam = searchParams.get("error");

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Get user's enrollments to check if already enrolled
  const {
    enrollments,
    loading: enrollmentsLoading,
    enrollInCourse,
  } = useEnrollments();

  // Check if user is enrolled in this course
  const userEnrollment = enrollments.find((e) => e.courseId === courseId);
  const isEnrolled = !!userEnrollment;
  const enrollmentStatus = {
    isEnrolled,
    progress: userEnrollment?.progress || 0,
    status: userEnrollment?.status || "NOT_ENROLLED",
    enrollmentId: userEnrollment?.id,
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [params.id]);

  // Show error message if redirected from learn page
  useEffect(() => {
    if (errorParam === "not-enrolled") {
      toast.error("Debes inscribirte en el curso para acceder al contenido");
      // Clean up the URL
      router.replace(`/dashboard/courses/${courseId}`, { scroll: false });
    }
  }, [errorParam, courseId, router]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 CourseDetailPage: Fetching course with ID:", courseId);

      const data = await apiCall(`/course/${courseId}`);
      console.log("🔍 CourseDetailPage: API response:", data);

      const courseData = (data as any).course || data;
      console.log("🔍 CourseDetailPage: Course data:", courseData);

      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (isEnrolled) {
      toast.info("Ya estás inscrito en este curso");
      return;
    }

    try {
      setEnrolling(true);
      console.log("🔍 CourseDetailPage: Enrolling in course:", courseId);

      const enrollment = await enrollInCourse(courseId);

      toast.success("¡Te has inscrito exitosamente al curso!");
      console.log(
        "✅ CourseDetailPage: Successfully enrolled in course:",
        enrollment.id
      );

      // Stay on the current page - the enrollment status will be updated automatically
      // through the useEnrollments hook which will trigger a re-render
    } catch (error) {
      console.error("❌ CourseDetailPage: Error enrolling:", error);

      // Handle specific error messages
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al inscribirse al curso";

      if (
        errorMessage.includes("already enrolled") ||
        errorMessage.includes("ya estás inscrito")
      ) {
        toast.error("Ya estás inscrito en este curso");
      } else if (
        errorMessage.includes("not found") ||
        errorMessage.includes("no encontrado")
      ) {
        toast.error("Curso no encontrado o no disponible");
      } else {
        toast.error("Error al inscribirse al curso. Inténtalo de nuevo.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleStartLearning = () => {
    router.push(`/development/courses/${courseId}/learn`);
  };

  if (loading || enrollmentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Curso no encontrado</h1>
        <Button onClick={handleBack}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <span>/</span>
        <span className="text-foreground">{course.title}</span>
      </div>

      <CourseDetail
        course={course}
        onEnroll={handleEnroll}
        onStartLearning={handleStartLearning}
        enrollment={enrollmentStatus}
        enrolling={enrolling}
      />
    </div>
  );
}
