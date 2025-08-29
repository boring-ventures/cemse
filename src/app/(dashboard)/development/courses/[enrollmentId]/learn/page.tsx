"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiCall } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  User,
  Play,
  CheckCircle,
  Award,
  Target,
  Loader2,
  Lock,
  Video,
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  Star,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react";
import { useCourseEnrollments } from "@/hooks/useCourseEnrollments";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useQuizSystem } from "@/hooks/useQuizSystem";
import { ModernVideoPlayer } from "@/components/video/ModernVideoPlayer";
import { QuizComponent } from "@/components/courses/QuizComponent";
import { QuizSelector } from "@/components/courses/QuizSelector";
import { ResourcesModal } from "@/components/courses/ResourcesModal";
import { QuizCompletionModal } from "@/components/courses/quiz-completion-modal";
import { LessonCompletionModal } from "@/components/courses/lesson-completion-modal";
import { CourseDataInspector } from "@/components/debug/course-data-inspector";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: "VIDEO" | "TEXT" | "QUIZ" | "EXERCISE" | "DOCUMENT";
  videoUrl?: string;
  duration: number;
  orderIndex: number;
  isRequired: boolean;
  isPreview: boolean;
  attachments?: any;
  resources?: any[];
  quizzes?: any[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  estimatedDuration: number;
  isLocked: boolean;
  prerequisites: string[];
  hasCertificate: boolean;
  lessons: Lesson[];
}

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.enrollmentId as string;

  const { getEnrollmentById, getEnrollmentForLearning } =
    useCourseEnrollments();
  const { completeLesson, updateVideoProgress, getEnrollmentProgress } =
    useCourseProgress(enrollmentId);
  const { loadQuiz, checkQuizAttempts, getEnrollmentAttempts } =
    useQuizSystem();

  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del curso
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>(
    {}
  );
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizSelector, setShowQuizSelector] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, any>>({});
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "resources" | "notes"
  >("description");
  const [showQuizCompletionModal, setShowQuizCompletionModal] = useState(false);
  const [selectedQuizAttempt, setSelectedQuizAttempt] = useState<any>(null);
  const [showLessonCompletionModal, setShowLessonCompletionModal] =
    useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        console.log(
          "🔍 CourseLearningPage: Loading enrollment with ID:",
          enrollmentId
        );

        // Intentar cargar datos completos para aprendizaje primero
        let enrollmentData = await getEnrollmentForLearning(enrollmentId);

        // Si no se obtuvieron datos completos, usar el método normal como fallback
        if (!enrollmentData) {
          console.log(
            "🔍 CourseLearningPage: Fallback to normal enrollment endpoint"
          );
          enrollmentData = await getEnrollmentById(enrollmentId);
        }

        console.log(
          "🔍 CourseLearningPage: Final enrollment data:",
          enrollmentData
        );

        if (!enrollmentData) {
          throw new Error("No se encontró la inscripción al curso");
        }

        // Verificar si las lecciones tienen resources y quizzes
        const needsResourcesAndQuizzes = enrollmentData.course?.modules?.some(
          (module: any) =>
            module.lessons?.some(
              (lesson: any) =>
                lesson.resources === undefined || lesson.quizzes === undefined
            )
        );

        if (needsResourcesAndQuizzes) {
          console.log(
            "🔍 CourseLearningPage: Loading resources and quizzes separately..."
          );

          // Cargar resources y quizzes para cada lección
          for (const module of enrollmentData.course.modules || []) {
            for (const lesson of module.lessons || []) {
              try {
                // Cargar recursos si no existen
                if (lesson.resources === undefined) {
                  const resourcesResponse = (await apiCall(
                    `/lesson/${lesson.id}/resources`
                  )) as any;
                  lesson.resources = resourcesResponse.resources || [];
                }

                // Cargar quizzes si no existen
                if (lesson.quizzes === undefined) {
                  const quizzesResponse = (await apiCall(
                    `/lesson/${lesson.id}/quizzes`
                  )) as any;
                  lesson.quizzes = quizzesResponse.quizzes || [];
                }
              } catch (err) {
                console.warn(
                  `Failed to load additional data for lesson ${lesson.id}:`,
                  err
                );
                // Asignar arrays vacíos si falla la carga
                if (lesson.resources === undefined) lesson.resources = [];
                if (lesson.quizzes === undefined) lesson.quizzes = [];
              }
            }
          }
        }

        setEnrollment(enrollmentData);

        // Debug: Log de la estructura de datos
        console.log("🔍 CourseLearningPage: Final course structure:", {
          course: enrollmentData.course,
          modules: enrollmentData.course?.modules,
          firstModule: enrollmentData.course?.modules?.[0],
          firstLesson: enrollmentData.course?.modules?.[0]?.lessons?.[0],
          lessonResources:
            enrollmentData.course?.modules?.[0]?.lessons?.[0]?.resources,
          lessonQuizzes:
            enrollmentData.course?.modules?.[0]?.lessons?.[0]?.quizzes,
        });

        // Cargar progreso del curso
        const progressData = await getEnrollmentProgress();
        if (progressData) {
          setCourseProgress(progressData);

          // Actualizar el progreso de lecciones
          const lessonProgressMap: Record<string, boolean> = {};
          if (progressData.modules && Array.isArray(progressData.modules)) {
            progressData.modules.forEach((module: any) => {
              if (module.lessons && Array.isArray(module.lessons)) {
                module.lessons.forEach((lesson: any) => {
                  lessonProgressMap[lesson.id] = lesson.isCompleted;
                });
              }
            });
          }
          setLessonProgress(lessonProgressMap);
        }

        // Cargar intentos de quiz para cada lección usando el nuevo hook
        const attemptsMap: Record<string, any> = {};
        for (const module of enrollmentData.course.modules || []) {
          for (const lesson of module.lessons || []) {
            if (lesson.quizzes && lesson.quizzes.length > 0) {
              try {
                const quizId = lesson.quizzes[0].id;
                const attempt = await checkQuizAttempts(quizId, enrollmentId);

                if (attempt) {
                  attemptsMap[lesson.id] = attempt;
                  console.log(
                    `🔍 Found completed attempt for lesson ${lesson.id}:`,
                    attempt
                  );
                } else {
                  console.log(
                    `🔍 No completed attempts found for lesson ${lesson.id}`
                  );
                }
              } catch (err) {
                console.warn(
                  `Failed to load quiz attempts for lesson ${lesson.id}:`,
                  err
                );
              }
            }
          }
        }
        setQuizAttempts(attemptsMap);
        console.log(
          "🔍 CourseLearningPage: Loaded quiz attempts:",
          attemptsMap
        );

        // Seleccionar el primer módulo y lección por defecto
        if (enrollmentData.course?.modules?.length > 0) {
          const firstModule = enrollmentData.course.modules[0];
          setSelectedModule(firstModule);

          if (firstModule.lessons?.length > 0) {
            console.log(
              "🎥 CourseLearningPage - Setting first lesson:",
              firstModule.lessons[0]
            );
            setSelectedLesson(firstModule.lessons[0]);
          }

          // Expandir el primer módulo
          setExpandedModules(new Set([firstModule.id]));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar el curso";
        setError(errorMessage);
        console.error("Error loading course:", err);
      } finally {
        setLoading(false);
      }
    };

    if (enrollmentId) {
      loadCourseData();
    }
  }, [enrollmentId]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const selectLesson = (module: Module, lesson: Lesson) => {
    console.log("🔍 selectLesson: Selected lesson data:", {
      lesson,
      resources: lesson.resources,
      quizzes: lesson.quizzes,
      attachments: lesson.attachments,
    });
    console.log("🎥 selectLesson - Video data:", {
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
    });

    setSelectedModule(module);
    setSelectedLesson(lesson);

    // Expandir el módulo si no está expandido
    if (!expandedModules.has(module.id)) {
      setExpandedModules(new Set([...expandedModules, module.id]));
    }
  };

  const navigateToNextLesson = () => {
    if (!selectedLesson || !selectedModule || !enrollment) return;

    // Encontrar la lección siguiente
    const currentModuleIndex = enrollment.course.modules.findIndex(
      (m: any) => m.id === selectedModule.id
    );
    const currentLessonIndex = selectedModule.lessons.findIndex(
      (l: any) => l.id === selectedLesson.id
    );

    if (currentLessonIndex < selectedModule.lessons.length - 1) {
      // Siguiente lección en el mismo módulo
      const nextLesson = selectedModule.lessons[currentLessonIndex + 1];
      selectLesson(selectedModule, nextLesson);
    } else if (currentModuleIndex < enrollment.course.modules.length - 1) {
      // Primera lección del siguiente módulo
      const nextModule = enrollment.course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        const firstLesson = nextModule.lessons[0];
        selectLesson(nextModule, firstLesson);
      }
    } else {
      alert("¡Has completado todas las lecciones del curso!");
    }
  };

  const navigateToPreviousLesson = () => {
    if (!selectedLesson || !selectedModule || !enrollment) return;

    // Encontrar la lección anterior
    const currentModuleIndex = enrollment.course.modules.findIndex(
      (m: any) => m.id === selectedModule.id
    );
    const currentLessonIndex = selectedModule.lessons.findIndex(
      (l: any) => l.id === selectedLesson.id
    );

    if (currentLessonIndex > 0) {
      // Lección anterior en el mismo módulo
      const previousLesson = selectedModule.lessons[currentLessonIndex - 1];
      selectLesson(selectedModule, previousLesson);
    } else if (currentModuleIndex > 0) {
      // Última lección del módulo anterior
      const previousModule = enrollment.course.modules[currentModuleIndex - 1];
      if (previousModule.lessons.length > 0) {
        const lastLesson =
          previousModule.lessons[previousModule.lessons.length - 1];
        selectLesson(previousModule, lastLesson);
      }
    } else {
      alert("Esta es la primera lección del curso.");
    }
  };

  const getLessonIcon = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "QUIZ":
        return <Target className="h-4 w-4" />;
      case "EXERCISE":
        return <BookOpen className="h-4 w-4" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return <Video className="h-20 w-20 mx-auto opacity-30" />;
      case "TEXT":
        return <FileText className="h-20 w-20 mx-auto opacity-30" />;
      case "QUIZ":
        return <Target className="h-20 w-20 mx-auto opacity-30" />;
      case "EXERCISE":
        return <BookOpen className="h-20 w-20 mx-auto opacity-30" />;
      case "DOCUMENT":
        return <FileText className="h-20 w-20 mx-auto opacity-30" />;
      default:
        return <FileText className="h-20 w-20 mx-auto opacity-30" />;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return "Video";
      case "TEXT":
        return "Texto";
      case "QUIZ":
        return "Quiz";
      case "EXERCISE":
        return "Ejercicio";
      case "DOCUMENT":
        return "Documento";
      default:
        return "Contenido";
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress[lessonId] || false;
  };

  const getNextLesson = () => {
    if (!selectedLesson || !selectedModule || !enrollment) return null;

    // Encontrar la lección siguiente
    const currentModuleIndex = enrollment.course.modules.findIndex(
      (m: any) => m.id === selectedModule.id
    );
    const currentLessonIndex = selectedModule.lessons.findIndex(
      (l: any) => l.id === selectedLesson.id
    );

    if (currentLessonIndex < selectedModule.lessons.length - 1) {
      // Siguiente lección en el mismo módulo
      const nextLesson = selectedModule.lessons[currentLessonIndex + 1];
      return {
        id: nextLesson.id,
        title: nextLesson.title,
        moduleTitle: selectedModule.title,
      };
    } else if (currentModuleIndex < enrollment.course.modules.length - 1) {
      // Primera lección del siguiente módulo
      const nextModule = enrollment.course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        const firstLesson = nextModule.lessons[0];
        return {
          id: firstLesson.id,
          title: firstLesson.title,
          moduleTitle: nextModule.title,
        };
      }
    }

    return null;
  };

  const handleLessonComplete = async () => {
    if (!selectedLesson) return;

    try {
      setCompletingLesson(true);
      console.log(
        "🔍 CourseLearningPage: Completing lesson:",
        selectedLesson.id
      );

      // Usar el endpoint correcto para completar lección
      const response = (await apiCall("/course-progress/complete-lesson", {
        method: "POST",
        body: JSON.stringify({
          enrollmentId,
          lessonId: selectedLesson.id,
          timeSpent: selectedLesson.duration * 60, // Tiempo en segundos
          videoProgress: 1.0, // Video progress completo
        }),
      })) as any;

      if (response) {
        console.log(
          "🔍 CourseLearningPage: Lesson completion response:",
          response
        );

        // Actualizar progreso local
        setLessonProgress((prev) => ({
          ...prev,
          [selectedLesson.id]: true,
        }));

        // Actualizar progreso del curso
        if (courseProgress) {
          setCourseProgress((prev: any) => ({
            ...prev,
            enrollment: {
              ...prev.enrollment,
              progress:
                response.courseProgress?.progress || prev.enrollment.progress,
            },
            course: {
              ...prev.course,
              progress:
                response.courseProgress?.progress || prev.course.progress,
              completedLessons:
                response.courseProgress?.completedLessons ||
                prev.course.completedLessons,
            },
            nextLesson: response.nextLesson,
          }));
        }

        console.log(
          "🔍 CourseLearningPage: Lesson completed successfully:",
          response
        );

        // Cerrar el modal
        setShowLessonCompletionModal(false);

        // Si hay siguiente lección, sugerir navegar a ella
        if (response.nextLesson) {
          console.log(
            "🔍 CourseLearningPage: Next lesson available:",
            response.nextLesson
          );
          const shouldNavigate = confirm(
            "¿Deseas continuar con la siguiente lección?"
          );
          if (shouldNavigate) {
            navigateToNextLesson();
          }
        }
      }
    } catch (error) {
      console.error("Error al marcar lección como completada:", error);
      alert("Error al completar la lección. Inténtalo de nuevo.");
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleVideoProgress = async (progress: number) => {
    if (!selectedLesson) return;

    try {
      console.log("🔍 CourseLearningPage: Updating video progress:", progress);

      // Ensure duration is a valid number, default to 0 if not
      const validDuration =
        selectedLesson.duration && !isNaN(selectedLesson.duration)
          ? selectedLesson.duration
          : 0;
      const timeSpentSeconds = validDuration * 60;

      console.log("🔍 CourseLearningPage: Duration validation:", {
        originalDuration: selectedLesson.duration,
        validDuration,
        timeSpentSeconds,
      });

      const result = await updateVideoProgress(
        selectedLesson.id,
        progress,
        timeSpentSeconds
      );

      if (result) {
        console.log("🔍 CourseLearningPage: Video progress updated:", result);
      }
    } catch (error) {
      console.error("Error al actualizar progreso del video:", error);
    }
  };

  const handleQuizComplete = (results: any) => {
    console.log("🔍 CourseLearningPage: Quiz completed:", results);
    setShowQuiz(false);
    setCurrentQuiz(null);

    // Actualizar intentos de quiz
    if (selectedLesson) {
      setQuizAttempts((prev) => ({
        ...prev,
        [selectedLesson.id]: results,
      }));
    }

    // Si aprobó el quiz, marcar la lección como completada
    if (results.passed && selectedLesson) {
      console.log(
        "🔍 CourseLearningPage: Quiz passed, marking lesson as completed"
      );
      handleLessonComplete();
    } else {
      console.log(
        "🔍 CourseLearningPage: Quiz failed, lesson not marked as completed"
      );
    }
  };

  // Función para recargar intentos de quiz para una lección específica
  const reloadQuizAttempts = async (lessonId: string) => {
    if (!enrollment?.course) return;

    // Encontrar la lección
    let targetLesson: any = null;
    for (const module of enrollment.course.modules || []) {
      const lesson = module.lessons?.find((l: any) => l.id === lessonId);
      if (lesson) {
        targetLesson = lesson;
        break;
      }
    }

    if (targetLesson?.quizzes && targetLesson.quizzes.length > 0) {
      try {
        const quizId = targetLesson.quizzes[0].id;
        const attempt = await checkQuizAttempts(quizId, enrollmentId);

        if (attempt) {
          setQuizAttempts((prev) => ({
            ...prev,
            [lessonId]: attempt,
          }));
          console.log(
            `🔍 Updated quiz attempts for lesson ${lessonId}:`,
            attempt
          );
        } else {
          // Remover el intento si ya no existe
          setQuizAttempts((prev) => {
            const newAttempts = { ...prev };
            delete newAttempts[lessonId];
            return newAttempts;
          });
          console.log(`🔍 No completed attempts found for lesson ${lessonId}`);
        }
      } catch (err) {
        console.warn(
          `Failed to reload quiz attempts for lesson ${lessonId}:`,
          err
        );
      }
    }
  };

  const startQuiz = async () => {
    if (!selectedLesson) {
      console.warn("No hay lección seleccionada");
      return;
    }

    // Si hay múltiples quizzes, mostrar el selector
    if (selectedLesson.quizzes && selectedLesson.quizzes.length > 1) {
      setShowQuizSelector(true);
      return;
    }

    try {
      // Intentar cargar el quiz desde el backend
      if (selectedLesson.quizzes && selectedLesson.quizzes.length > 0) {
        const quizId = selectedLesson.quizzes[0].id;
        const quiz = await loadQuiz(quizId);

        if (quiz) {
          setCurrentQuiz(quiz);
          setShowQuiz(true);
        } else {
          console.warn("No se pudo cargar el quiz desde el backend");
          // Usar el quiz del array como fallback
          setCurrentQuiz(selectedLesson.quizzes[0]);
          setShowQuiz(true);
        }
      } else {
        console.warn("No hay quiz disponible para esta lección");
        // TODO: Mostrar notificación al usuario
      }
    } catch (error) {
      console.error("Error al cargar el quiz:", error);
      // TODO: Mostrar notificación de error al usuario
    }
  };

  const selectQuiz = (quiz: any) => {
    setCurrentQuiz(quiz);
    setShowQuizSelector(false);
    setShowQuiz(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                {error || "Error al cargar el curso"}
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { course } = enrollment;

  if (showQuizSelector && selectedLesson?.quizzes) {
    return (
      <QuizSelector
        quizzes={selectedLesson.quizzes}
        enrollmentId={enrollmentId}
        onSelectQuiz={selectQuiz}
        onCancel={() => setShowQuizSelector(false)}
      />
    );
  }

  if (showQuiz) {
    // Show loading if quiz is being loaded
    if (!currentQuiz) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando quiz...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowQuiz(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la Lección
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{currentQuiz.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Evalúa tu conocimiento
                </p>
              </div>
            </div>
          </div>
        </div>

        <QuizComponent
          quiz={currentQuiz}
          enrollmentId={enrollmentId}
          onComplete={handleQuizComplete}
          onCancel={() => setShowQuiz(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header Estilo Udemy */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Button>

            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {course.title}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    Progreso:{" "}
                    {courseProgress?.course?.progress ||
                      enrollment.progress ||
                      0}
                    %
                  </p>
                </div>
                {courseProgress?.course && (
                  <p className="text-sm text-gray-600">
                    {courseProgress.course.completedLessons} de{" "}
                    {courseProgress.course.totalLessons} lecciones
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Contenido Principal - Estilo Udemy */}
        <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
          {selectedLesson ? (
            <>
              {/* Modern Video Player Section */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black h-[500px] min-h-[400px] w-full">
                {(() => {
                  console.log(
                    "🎥 CourseLearningPage - selectedLesson:",
                    selectedLesson
                  );
                  console.log(
                    "🎥 CourseLearningPage - contentType:",
                    selectedLesson?.contentType
                  );
                  console.log(
                    "🎥 CourseLearningPage - videoUrl:",
                    selectedLesson?.videoUrl
                  );

                  const hasVideo =
                    selectedLesson.contentType === "VIDEO" &&
                    selectedLesson.videoUrl &&
                    selectedLesson.videoUrl.trim() !== "";

                  console.log("🎥 CourseLearningPage - hasVideo:", hasVideo);

                  return hasVideo;
                })() ? (
                  <div className="relative w-full h-full">
                    <ModernVideoPlayer
                      src={selectedLesson.videoUrl || ""}
                      title={selectedLesson.title}
                      onProgress={handleVideoProgress}
                      onTimeUpdate={(currentTime) => {
                        // Video time tracking with less verbose logging
                        if (Math.floor(currentTime) % 10 === 0) {
                          console.log(
                            `🎥 Video progress: ${Math.floor(currentTime)}s`
                          );
                        }
                      }}
                      onPlay={() => {
                        console.log("🎥 Video started playing");
                      }}
                      onPause={() => {
                        console.log("🎥 Video paused");
                      }}
                      onEnded={() => {
                        console.log(
                          "🎥 Video ended - suggesting lesson completion"
                        );
                        // Auto-suggest lesson completion when video ends
                        if (!isLessonCompleted(selectedLesson.id)) {
                          setTimeout(() => {
                            setShowLessonCompletionModal(true);
                          }, 1000); // Small delay for better UX
                        }
                      }}
                      className="w-full h-full"
                      autoPlay={false}
                      showControls={true}
                    />

                    {/* Lesson Navigation Pills - Bottom */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                      <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={navigateToPreviousLesson}
                          disabled={!selectedLesson || !selectedModule}
                          className="text-white hover:bg-white/20 rounded-full px-3 py-1 text-xs"
                        >
                          <ArrowLeft className="h-3 w-3 mr-1" />
                          Anterior
                        </Button>

                        <div className="text-white text-xs font-medium px-2">
                          Lección {selectedModule?.orderIndex}.
                          {selectedLesson.orderIndex}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={navigateToNextLesson}
                          disabled={!selectedLesson || !selectedModule}
                          className="text-white hover:bg-white/20 rounded-full px-3 py-1 text-xs"
                        >
                          Siguiente
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg">
                    <div className="text-center text-white max-w-md mx-auto p-8">
                      <div className="relative mb-6">
                        {selectedLesson.contentType === "VIDEO" ? (
                          <div className="relative">
                            <Video className="h-24 w-24 mx-auto opacity-20" />
                            <div className="absolute inset-0 animate-ping">
                              <Video className="h-24 w-24 mx-auto opacity-10" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                            {getContentTypeIcon(selectedLesson.contentType)}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-3">
                        {selectedLesson.contentType === "VIDEO"
                          ? "Video no disponible"
                          : `Contenido: ${getContentTypeLabel(selectedLesson.contentType)}`}
                      </h3>

                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {selectedLesson.contentType === "VIDEO"
                          ? "Esta lección no tiene un video válido configurado. Contacta al instructor para más información."
                          : "Esta lección contiene contenido de texto y recursos. Revisa la información detallada más abajo."}
                      </p>

                      {selectedLesson.contentType === "VIDEO" && (
                        <div className="bg-black/30 rounded-lg p-4 mt-6 border border-white/10">
                          <h4 className="text-sm font-medium text-gray-200 mb-2">
                            Información técnica:
                          </h4>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>
                              URL: {selectedLesson.videoUrl || "No configurada"}
                            </p>
                            <p>Tipo: {selectedLesson.contentType}</p>
                            <p>
                              Estado:{" "}
                              {selectedLesson.videoUrl
                                ? "URL configurada pero no válida"
                                : "URL no configurada"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Navigation for non-video lessons */}
                      <div className="flex justify-center gap-3 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={navigateToPreviousLesson}
                          disabled={!selectedLesson || !selectedModule}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={navigateToNextLesson}
                          disabled={!selectedLesson || !selectedModule}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contenido de la Lección - Estilo Udemy */}
              <div className="flex-1 relative z-20">
                <div className="bg-white">
                  {/* Tabs de Contenido */}
                  <div className="border-b border-gray-200 relative z-30 bg-white">
                    <div className="max-w-4xl mx-auto px-6">
                      <div className="flex space-x-8">
                        <button className="py-4 px-1 border-b-2 border-purple-600 text-purple-600 font-medium text-sm">
                          Descripción general
                        </button>
                        <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                          Recursos
                        </button>
                        <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                          Notas
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenido Principal */}
                  <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Header de la lección */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {selectedLesson.contentType}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDuration(selectedLesson.duration)}
                        </span>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {selectedLesson.title}
                      </h1>
                      <p className="text-gray-600 text-lg">
                        {selectedLesson.description}
                      </p>
                    </div>

                    {/* Contenido de la lección */}
                    <div className="prose max-w-none mb-8">
                      {(() => {
                        console.log(
                          "🎥 CourseLearningPage - Lesson content:",
                          selectedLesson.content
                        );
                        return (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedLesson.content,
                            }}
                          />
                        );
                      })()}
                    </div>

                    {/* Barra de Acciones - Estilo Udemy */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        {/* Botón de Recursos */}
                        <Button
                          variant="outline"
                          onClick={() => setShowResourcesModal(true)}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Recursos ({selectedLesson.resources?.length || 0})
                        </Button>

                        {/* Botón de Quiz */}
                        <div className="flex items-center gap-3">
                          {selectedLesson.quizzes &&
                          selectedLesson.quizzes.length > 0 ? (
                            (() => {
                              console.log("🔍 Quiz button render:", {
                                lessonId: selectedLesson.id,
                                hasQuizAttempt:
                                  !!quizAttempts[selectedLesson.id],
                                quizAttempts: quizAttempts[selectedLesson.id],
                              });
                              return quizAttempts[selectedLesson.id];
                            })() ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedQuizAttempt(
                                      quizAttempts[selectedLesson.id]
                                    );
                                    setShowQuizCompletionModal(true);
                                  }}
                                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  Ver Resultados
                                </Button>
                                <Badge
                                  variant={
                                    quizAttempts[selectedLesson.id].passed
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-sm font-medium"
                                >
                                  {quizAttempts[selectedLesson.id].score}%
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  onClick={startQuiz}
                                  className="bg-orange-500 hover:bg-orange-600"
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  Tomar Quiz ({selectedLesson.quizzes.length})
                                </Button>
                                {/* Botón de debug temporal */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    reloadQuizAttempts(selectedLesson.id)
                                  }
                                  className="text-xs"
                                  title="Recargar intentos de quiz"
                                >
                                  🔄
                                </Button>
                              </div>
                            )
                          ) : (
                            <Button
                              variant="outline"
                              disabled
                              className="bg-gray-50 text-gray-400"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Sin Quiz
                            </Button>
                          )}
                        </div>

                        {/* Botón de Completar - Solo mostrar si no está completada */}
                        {!isLessonCompleted(selectedLesson.id) ? (
                          <Button
                            onClick={() => setShowLessonCompletionModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Completada
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="bg-green-50 border-green-200 text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Lección Completada
                          </Button>
                        )}
                      </div>

                      {/* Navegación entre Lecciones */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={navigateToPreviousLesson}
                          disabled={!selectedLesson || !selectedModule}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Lección Anterior
                        </Button>

                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            Progreso de la lección
                          </p>
                          <p className="text-xs text-purple-600 font-medium">
                            {selectedLesson.title}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={navigateToNextLesson}
                          disabled={!selectedLesson || !selectedModule}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Siguiente Lección
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  Selecciona una lección
                </h2>
                <p className="text-gray-600">
                  Elige una lección del menú lateral para comenzar a aprender
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Estilo Udemy */}
        <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto sticky top-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Contenido del curso
            </h2>

            <div className="space-y-1">
              {course.modules?.map((module: Module) => (
                <div
                  key={module.id}
                  className="border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => toggleModuleExpansion(module.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            courseProgress?.modules?.find(
                              (m: any) => m.id === module.id
                            )?.isCompleted || false
                          }
                          readOnly
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {module.orderIndex}. {module.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {module.lessons?.length || 0} lecciones
                      </span>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {module.lessons?.map((lesson: Lesson, index: number) => (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 hover:bg-gray-100 transition-colors ${
                            selectedLesson?.id === lesson.id
                              ? "bg-purple-50 border-r-2 border-purple-500"
                              : ""
                          }`}
                        >
                          <button
                            onClick={() => selectLesson(module, lesson)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isLessonCompleted(lesson.id)}
                                readOnly
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">
                                {module.orderIndex}.{index + 1} {lesson.title}
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.duration)}
                            </span>
                            {lesson.resources &&
                              lesson.resources.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowResourcesModal(true)}
                                  className="h-6 px-2 text-xs text-purple-600 hover:bg-purple-50"
                                >
                                  Recursos
                                </Button>
                              )}
                            {isLessonCompleted(lesson.id) && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Recursos */}
      <ResourcesModal
        isOpen={showResourcesModal}
        onClose={() => setShowResourcesModal(false)}
        resources={selectedLesson?.resources || []}
        lessonTitle={selectedLesson?.title || ""}
      />

      {/* Modal de Completación del Quiz */}
      {selectedQuizAttempt && (
        <QuizCompletionModal
          isOpen={showQuizCompletionModal}
          onClose={() => {
            setShowQuizCompletionModal(false);
            setSelectedQuizAttempt(null);
          }}
          quizAttempt={selectedQuizAttempt}
          quizTitle={selectedLesson?.title || "Quiz"}
          onRetake={() => {
            setShowQuizCompletionModal(false);
            setSelectedQuizAttempt(null);
            startQuiz();
          }}
        />
      )}

      {/* Modal de Completación de Lección */}
      <LessonCompletionModal
        isOpen={showLessonCompletionModal}
        onClose={() => setShowLessonCompletionModal(false)}
        onConfirm={handleLessonComplete}
        lessonTitle={selectedLesson?.title || ""}
        nextLesson={getNextLesson()}
        loading={completingLesson}
      />

      {/* Debug Component */}
      {process.env.NODE_ENV === "development" && (
        <CourseDataInspector
          data={{
            enrollment,
            selectedLesson,
            selectedModule,
            courseProgress,
            lessonProgress,
          }}
          title="Course Learning Debug Data"
        />
      )}
    </div>
  );
}
