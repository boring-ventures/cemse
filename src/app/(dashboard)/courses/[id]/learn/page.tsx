"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  Download,
  Star,
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  Award,
} from "lucide-react";
import { QuizComponent } from "@/components/courses/quiz-component";
import { LessonNotes } from "@/components/courses/lesson-notes";
import { CourseSection } from "@/components/courses/course-section";
import type {
  CourseResource,
  Quiz,
  QuizQuestion,
  ResourceType,
  Module,
  Lesson,
} from "@/types/courses";
import type { Course } from "@/types/api";
import {
  CourseCategory,
  CourseLevel,
  LessonType,
  QuestionType,
} from "@/types/courses";
import { LessonPlayer } from "@/components/courses/lesson-player";
import { useCourseEnrollments } from "@/hooks/useCourseEnrollments";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface Resource {
  id: string;
  title: string;
  description?: string;
  type: "PDF" | "VIDEO" | "LINK" | "IMAGE";
  url: string;
  fileSize?: string;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExtendedLesson extends Lesson {
  completed?: boolean;
}

interface ExtendedModule extends Omit<Module, "lessons"> {
  completed?: boolean;
  lessons: ExtendedLesson[];
}

interface ExtendedCourse extends Omit<Course, "modules"> {
  modules: ExtendedModule[];
  totalProgress: number;
  certificate?: {
    id: string;
    url: string;
    issuedAt: Date;
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseLearnPage({ params }: PageProps) {
  return <CourseLearnClient params={params} />;
}

// Client component to handle state and hooks
function CourseLearnClient({ params }: PageProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");

  // Resolve params on mount
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const {
    enrollments,
    loading: enrollmentsLoading,
    getEnrollmentForLearning,
  } = useCourseEnrollments();

  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");

  // Check if user is enrolled in this course
  const userEnrollment = enrollments.find((e) => e.courseId === courseId);
  const isEnrolled = !!userEnrollment;

  // Redirect if not enrolled (after loading is complete)
  useEffect(() => {
    if (!enrollmentsLoading && !loading && courseId && !isEnrolled) {
      console.log("❌ User not enrolled in course:", courseId);
      router.push(`/dashboard/courses/${courseId}?error=not-enrolled`);
    }
  }, [enrollmentsLoading, loading, courseId, isEnrolled, router]);

  // Fetch complete course data with modules and lessons when enrollment is found
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!userEnrollment || !courseId) return;

      try {
        setLoading(true);
        setError(null);

        console.log(
          "🔍 Fetching complete course data for enrollment:",
          userEnrollment.id
        );

        // Get complete enrollment data with course modules and lessons
        let enrollmentData = await getEnrollmentForLearning(userEnrollment.id);

        // If we couldn't get complete data, try to get basic enrollment data
        if (!enrollmentData || !enrollmentData.course) {
          console.log("🔍 Trying to get basic enrollment data as fallback");
          try {
            const basicData = (await apiCall(
              `/course-enrollments/${userEnrollment.id}`
            )) as any;
            enrollmentData = basicData.enrollment || basicData;
            console.log("🔍 Basic enrollment data:", enrollmentData);
          } catch (basicError) {
            console.error(
              "❌ Failed to get basic enrollment data:",
              basicError
            );
          }
        }

        if (!enrollmentData || !enrollmentData.course) {
          throw new Error("No se pudo cargar la información del curso");
        }

        console.log("✅ Complete course data received:", enrollmentData);
        console.log("🔍 Course data structure:", {
          hasCourse: !!enrollmentData.course,
          courseTitle: enrollmentData.course?.title,
          hasModules: !!enrollmentData.course?.modules,
          modulesCount: enrollmentData.course?.modules?.length || 0,
          modules:
            enrollmentData.course?.modules?.map((m: any) => ({
              id: m.id,
              title: m.title,
              lessonsCount: m.lessons?.length || 0,
            })) || [],
        });

        // Transform the enrollment course data to match our ExtendedCourse interface
        const courseData = enrollmentData.course;
        console.log("🔍 Course data modules:", courseData.modules?.length || 0);

        const extendedCourse: ExtendedCourse = {
          ...courseData,
          modules:
            courseData.modules?.map((module: any) => {
              console.log(
                "🔍 Processing module:",
                module.title,
                "with lessons:",
                module.lessons?.length || 0
              );
              return {
                id: module.id,
                title: module.title,
                description: module.description || "",
                order: module.orderIndex || 0,
                duration: module.estimatedDuration || module.duration || 0,
                isLocked: module.isLocked || false,
                completed: false,
                lessons:
                  module.lessons?.map((lesson: any) => ({
                    id: lesson.id,
                    moduleId: module.id,
                    title: lesson.title,
                    description: lesson.description || "",
                    type: (lesson.contentType ||
                      lesson.type ||
                      "TEXT") as LessonType,
                    content: {
                      video: lesson.videoUrl
                        ? {
                            url: lesson.videoUrl,
                            duration: lesson.duration || 0,
                            thumbnail: lesson.thumbnail || "",
                          }
                        : undefined,
                      textContent: lesson.content || "",
                      ...lesson.content,
                    },
                    duration: lesson.duration || 0,
                    order: lesson.orderIndex || 0,
                    isPreview: lesson.isPreview || false,
                    resources: lesson.resources || [],
                    quiz: lesson.quizzes?.[0] || undefined, // Take first quiz if available
                    completed: false,
                    createdAt: lesson.createdAt,
                    updatedAt: lesson.updatedAt,
                  })) || [],
                createdAt: module.createdAt,
                updatedAt: module.updatedAt,
              };
            }) || [],
          totalProgress: 0,
        };

        console.log(
          "✅ Extended course created with modules:",
          extendedCourse.modules.length
        );

        setCourse(extendedCourse);
        console.log("✅ Course state updated with modules and lessons");

        // If no modules/lessons, show a helpful message but don't crash
        if (extendedCourse.modules.length === 0) {
          console.log(
            "ℹ️ Course has no modules - this is okay, just showing course info"
          );
        }
      } catch (err) {
        console.error("❌ Error fetching course data:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar el curso"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [userEnrollment, courseId, getEnrollmentForLearning]);

  // Initialize current module and lesson when course is loaded
  useEffect(() => {
    if (course && course.modules.length > 0) {
      setCurrentModuleId(course.modules[0].id);
      if (course.modules[0].lessons.length > 0) {
        setCurrentLessonId(course.modules[0].lessons[0].id);
      }
    }
  }, [course]);

  const hasPreviousLesson = () => {
    if (!course || !currentModuleId || !currentLessonId) return false;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    return currentIndex > 0;
  };

  const hasNextLesson = () => {
    if (!course || !currentModuleId || !currentLessonId) return false;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    return currentIndex < allLessons.length - 1;
  };

  const getCurrentLesson = () => {
    if (!course || !currentModuleId || !currentLessonId) return null;
    return course.modules
      .find((m) => m.id === currentModuleId)
      ?.lessons.find((l) => l.id === currentLessonId);
  };

  const getCurrentModule = () => {
    if (!course || !currentModuleId) return null;
    return course.modules.find((m) => m.id === currentModuleId);
  };

  const handleLessonComplete = (lessonId: string) => {
    if (!course) return;

    setCourse((prev) => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.modules = updated.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        ),
      }));

      // Update module completion
      updated.modules = updated.modules.map((module) => ({
        ...module,
        completed: module.lessons.every((l) => l.completed),
      }));

      // Update total progress
      const totalLessons = updated.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0
      );
      const completedLessons = updated.modules.reduce(
        (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
        0
      );
      updated.totalProgress = Math.round(
        (completedLessons / totalLessons) * 100
      );

      // Check if course is completed
      if (updated.totalProgress === 100) {
        updated.certificate = {
          ...updated.certificate!,
          issuedAt: new Date(),
        };
      }

      return updated;
    });

    // Move to next lesson automatically
    const allLessons = course.modules.flatMap((m: ExtendedModule) =>
      m.lessons.map((l: ExtendedLesson) => ({ ...l, moduleId: m.id }))
    );
    const currentIndex = allLessons.findIndex(
      (l: ExtendedLesson & { moduleId: string }) => l.id === lessonId
    );
    const isLastLesson = currentIndex === allLessons.length - 1;

    if (isLastLesson) {
      // Confeti final por terminar TODO el curso
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.6 },
      });
      setShowCertificate(true);
    } else {
      // Espera y pasa a la siguiente lección
      setTimeout(() => {
        goToNextLesson();
      }, 1000);
    }
  };

  const goToNextLesson = () => {
    if (!course) return;

    const allLessons = course.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleId: m.id }))
    );
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setCurrentModuleId(nextLesson.moduleId);
      setCurrentLessonId(nextLesson.id);

      // Expand the module if needed
      if (!expandedModules.includes(nextLesson.moduleId)) {
        setExpandedModules([...expandedModules, nextLesson.moduleId]);
      }
    }
  };

  const goToPreviousLesson = () => {
    if (!course) return;

    const allLessons = course.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleId: m.id }))
    );
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setCurrentModuleId(prevLesson.moduleId);
      setCurrentLessonId(prevLesson.id);

      // Expand the module if needed
      if (!expandedModules.includes(prevLesson.moduleId)) {
        setExpandedModules([...expandedModules, prevLesson.moduleId]);
      }
    }
  };

  const selectLesson = (moduleId: string, lessonId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);

    // Expand the module if needed
    if (!expandedModules.includes(moduleId)) {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getProgress = () => {
    if (!course) return 0;
    const totalLessons = course.modules.reduce(
      (acc: number, module: ExtendedModule) => acc + module.lessons.length,
      0
    );
    const completedLessons = course.modules.reduce(
      (acc: number, module: ExtendedModule) =>
        acc +
        module.lessons.filter((lesson: ExtendedLesson) => lesson.completed)
          .length,
      0
    );
    return totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  };

  const handleModuleCompletion = (moduleId: string) => {
    if (!course) return;
    const updatedCourse: ExtendedCourse = {
      ...course,
      modules: course.modules.map((module: ExtendedModule) => {
        if (module.id === moduleId) {
          return {
            ...module,
            completed: module.lessons.every(
              (lesson: ExtendedLesson) => lesson.completed
            ),
          };
        }
        return module;
      }),
    };
    setCourse(updatedCourse);
  };

  const currentLesson = getCurrentLesson();
  const currentModule = getCurrentModule();

  if (loading || enrollmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error al cargar el curso</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Error desconocido"}
          </p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Curso no encontrado</h2>
          <p className="text-muted-foreground mb-4">
            El curso que buscas no existe o no tienes acceso a él.
          </p>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Course Content Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-0 md:w-16" : "w-full md:w-80"
        } bg-card border-r transition-all duration-300 overflow-hidden`}
      >
        {course && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold truncate">{course.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </Button>
            </div>

            {/* Course Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Progreso del curso
                </span>
                <span className="text-sm font-medium">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.duration}h</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {course.totalLessons} lecciones
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Modules */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              {course.modules.length > 0 ? (
                course.modules.map((module) => (
                  <Collapsible
                    key={module.id}
                    open={expandedModules.includes(module.id)}
                    onOpenChange={() => toggleModuleExpanded(module.id)}
                  >
                    <div
                      className={`p-3 mb-2 rounded-lg ${
                        module.completed
                          ? "bg-primary/10"
                          : module.isLocked
                            ? "bg-muted/50"
                            : "bg-card"
                      }`}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {module.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : module.isLocked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium">
                              {module.title}
                            </span>
                          </div>
                          {expandedModules.includes(module.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="pl-4">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(module.id, lesson.id)}
                            className={`w-full text-left p-2 rounded-lg mb-1 flex items-center gap-2 ${
                              currentLessonId === lesson.id
                                ? "bg-primary text-primary-foreground"
                                : lesson.completed
                                  ? "bg-primary/10"
                                  : "hover:bg-accent"
                            }`}
                            disabled={module.isLocked}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : lesson.type === LessonType.VIDEO ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-sm truncate">
                              {lesson.title}
                            </span>
                            {lesson.isPreview && (
                              <Badge variant="secondary" className="ml-auto">
                                Preview
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Contenido en desarrollo
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Este curso aún no tiene módulos o lecciones disponibles. El
                    contenido será añadido próximamente.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4">
        {course && currentLesson && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
              <p className="text-muted-foreground">
                {currentLesson.description}
              </p>
            </div>

            {/* Lesson Content */}
            {currentLesson.type === LessonType.VIDEO &&
              currentLesson.content.video && (
                <LessonPlayer
                  lesson={currentLesson}
                  onComplete={() => handleLessonComplete(currentLesson.id)}
                />
              )}

            {currentLesson.type === LessonType.QUIZ && currentLesson.quiz && (
              <QuizComponent
                quiz={currentLesson.quiz}
                onComplete={() => handleLessonComplete(currentLesson.id)}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={!hasPreviousLesson()}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={goToNextLesson} disabled={!hasNextLesson()}>
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Lesson Notes */}
            <LessonNotes lessonId={currentLesson.id} />
          </>
        )}

        {/* Show message when no lesson is available */}
        {course && !currentLesson && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            {course.modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este curso está en desarrollo. El contenido será añadido
                próximamente.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecciona un módulo del menú lateral para comenzar.
              </p>
            )}
          </div>
        )}

        {/* Course Completion Certificate */}
        {course?.certificate?.url && (
          <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>¡Felicitaciones!</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-8">
                <Award className="h-16 w-16 text-primary" />
                <p className="text-center">
                  Has completado exitosamente el curso{" "}
                  <strong>{course.title}</strong>. Puedes descargar tu
                  certificado haciendo clic en el botón de abajo.
                </p>
                {course.certificate && (
                  <Button
                    onClick={() => {
                      if (course.certificate?.url) {
                        window.open(course.certificate.url, "_blank");
                      }
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Certificado
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
