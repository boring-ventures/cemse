"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseCategory, CourseLevel } from "@/types/courses";
import { Question } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  VideoIcon,
  FileText,
  HelpCircle,
  BookOpen,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  lessons: Lesson[];
  isLocked: boolean;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: "video" | "reading" | "quiz";
  content: Record<string, unknown>;
  duration: number;
  order: number;
  isPreview: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  allowedAttempts: number;
  showCorrectAnswers: boolean;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [activeTab, setActiveTab] = useState("content");
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [courseData] = useState({
    title: "Habilidades Laborales Básicas",
    description:
      "Curso completo sobre competencias fundamentales para el trabajo",
    category: CourseCategory.SOFT_SKILLS,
    level: CourseLevel.BEGINNER,
    duration: 8,
    totalLessons: 15,
    rating: 4.8,
    studentCount: 2847,
    isActive: true,
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    // Mock data for demonstration
    const mockModules: Module[] = [
      {
        id: "mod-1",
        title: "Introducción a las Habilidades Laborales",
        description: "Conceptos fundamentales y bienvenida al curso",
        order: 1,
        duration: 45,
        isLocked: false,
        lessons: [
          {
            id: "lesson-1",
            moduleId: "mod-1",
            title: "Bienvenida al curso",
            description: "Video de introducción y bienvenida",
            type: "video",
            content: { videoUrl: "https://example.com/video1.mp4" },
            duration: 5,
            order: 1,
            isPreview: true,
          },
          {
            id: "lesson-2",
            moduleId: "mod-1",
            title: "¿Qué son las habilidades laborales?",
            description: "Conceptos básicos sobre habilidades en el trabajo",
            type: "video",
            content: { videoUrl: "https://example.com/video2.mp4" },
            duration: 8,
            order: 2,
            isPreview: false,
          },
          {
            id: "quiz-1",
            moduleId: "mod-1",
            title: "Evaluación: Conceptos básicos",
            description: "Quiz sobre los conceptos fundamentales",
            type: "quiz",
            content: {
              questions: [
                {
                  id: "q1",
                  type: "multiple_choice",
                  question:
                    "¿Cuáles son las habilidades blandas más importantes?",
                  options: [
                    "Comunicación",
                    "Programación",
                    "Matemáticas",
                    "Diseño",
                  ],
                  correctAnswer: "Comunicación",
                  explanation:
                    "La comunicación es fundamental en cualquier trabajo",
                  points: 10,
                },
              ],
            },
            duration: 10,
            order: 3,
            isPreview: false,
          },
        ],
      },
    ];
    setModules(mockModules);
    setExpandedModules(new Set(["mod-1"]));
  };

  const handleAddModule = (moduleData: Partial<Module>) => {
    const newModule: Module = {
      id: `mod-${Date.now()}`,
      title: moduleData.title || "",
      description: moduleData.description || "",
      order: modules.length + 1,
      duration: 0,
      lessons: [],
      isLocked: false,
      ...moduleData,
    };
    setModules([...modules, newModule]);
    setExpandedModules((prev) => new Set([...prev, newModule.id]));
  };

  const handleAddLesson = (moduleId: string, lessonData: Partial<Lesson>) => {
    const targetModule = modules.find((m) => m.id === moduleId);
    if (!targetModule) return;

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      moduleId,
      title: lessonData.title || "",
      description: lessonData.description || "",
      type: lessonData.type || "video",
      content: lessonData.content || {},
      duration: lessonData.duration || 0,
      order: targetModule.lessons.length + 1,
      isPreview: false,
      ...lessonData,
    };

    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      )
    );
  };

  const handleDeleteModule = (moduleId: string) => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar este módulo y todas sus lecciones?"
      )
    ) {
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    }
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta lección?")) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      );
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <VideoIcon className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      case "reading":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTotalDuration = () => {
    return modules.reduce(
      (total, mod) =>
        total +
        mod.lessons.reduce(
          (moduleTotal, lesson) => moduleTotal + lesson.duration,
          0
        ),
      0
    );
  };

  const getTotalLessons = () => {
    return modules.reduce((total, mod) => total + mod.lessons.length, 0);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{courseData.title}</h1>
            <p className="text-muted-foreground">
              Gestiona el contenido y estructura del curso
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/courses/${courseId}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </a>
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Módulos</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Lecciones</p>
                <p className="text-2xl font-bold">{getTotalLessons()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Duración</p>
                <p className="text-2xl font-bold">
                  {Math.floor(getTotalDuration() / 60)}h{" "}
                  {getTotalDuration() % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">
                  {courseData.studentCount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="content">Contenido del Curso</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estructura del Curso</CardTitle>
                <Button onClick={() => setShowModuleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Módulo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="border rounded-lg">
                    <Collapsible
                      open={expandedModules.has(module.id)}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {moduleIndex + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{module.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {module.lessons.length} lecciones •{" "}
                                {Math.floor(
                                  module.lessons.reduce(
                                    (total, lesson) => total + lesson.duration,
                                    0
                                  ) / 60
                                )}
                                h
                              </p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingModule(module);
                                  setShowModuleDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Módulo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteModule(module.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Módulo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4">
                          <div className="ml-8 space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">
                                    {lessonIndex + 1}
                                  </div>
                                  {getLessonIcon(lesson.type)}
                                  <div>
                                    <p className="font-medium text-sm">
                                      {lesson.title}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                      {lesson.type === "video"
                                        ? "Video"
                                        : lesson.type === "quiz"
                                          ? "Examen"
                                          : "Lectura"}{" "}
                                      • {lesson.duration} min
                                      {lesson.isPreview && (
                                        <Badge
                                          variant="secondary"
                                          className="ml-2 text-xs"
                                        >
                                          Vista previa
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingLesson(lesson);
                                        setShowLessonDialog(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar Lección
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteLesson(module.id, lesson.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar Lección
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}

                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingLesson({
                                  moduleId: module.id,
                                } as Lesson);
                                setShowLessonDialog(true);
                              }}
                              className="w-full mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Lección
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}

                {modules.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Sin contenido
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza agregando el primer módulo de tu curso
                    </p>
                    <Button onClick={() => setShowModuleDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Módulo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Las configuraciones básicas del curso se pueden editar desde la
                página de información general.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas del Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">78%</div>
                  <p className="text-sm text-muted-foreground">
                    Tasa de Finalización
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4.8</div>
                  <p className="text-sm text-muted-foreground">
                    Calificación Promedio
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    2,847
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estudiantes Inscritos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Dialog */}
      <ModuleDialog
        isOpen={showModuleDialog}
        onClose={() => {
          setShowModuleDialog(false);
          setEditingModule(null);
        }}
        onSave={handleAddModule}
        module={editingModule}
      />

      {/* Lesson Dialog */}
      <LessonDialog
        isOpen={showLessonDialog}
        onClose={() => {
          setShowLessonDialog(false);
          setEditingLesson(null);
        }}
        onSave={(lessonData) => {
          if (editingLesson?.moduleId) {
            handleAddLesson(editingLesson.moduleId, lessonData);
          }
        }}
        lesson={editingLesson}
      />
    </div>
  );
}

// Module Dialog Component
function ModuleDialog({
  isOpen,
  onClose,
  onSave,
  module: moduleData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Module>) => void;
  module?: Module | null;
}) {
  const [title, setTitle] = useState(moduleData?.title || "");
  const [description, setDescription] = useState(moduleData?.description || "");

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, description });
      onClose();
      setTitle("");
      setDescription("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {moduleData ? "Editar Módulo" : "Agregar Nuevo Módulo"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moduleTitle">Título del Módulo</Label>
            <Input
              id="moduleTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Introducción a las Habilidades Laborales"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moduleDescription">Descripción</Label>
            <Textarea
              id="moduleDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del contenido del módulo"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {moduleData ? "Actualizar" : "Crear"} Módulo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Lesson Dialog Component
function LessonDialog({
  isOpen,
  onClose,
  onSave,
  lesson,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Lesson>) => void;
  lesson?: Lesson | null;
}) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [type, setType] = useState<"video" | "reading" | "quiz">(
    lesson?.type || "video"
  );
  const [duration, setDuration] = useState(lesson?.duration || 0);
  const [videoUrl, setVideoUrl] = useState("");
  const [readingContent, setReadingContent] = useState("");

  const handleSave = () => {
    if (title.trim()) {
      const content =
        type === "video"
          ? { videoUrl }
          : type === "reading"
            ? { text: readingContent }
            : { questions: [] };

      onSave({
        title,
        description,
        type,
        duration,
        content,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {lesson?.id ? "Editar Lección" : "Agregar Nueva Lección"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Título de la Lección</Label>
              <Input
                id="lessonTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la lección"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonType">Tipo de Lección</Label>
              <Select
                value={type}
                onValueChange={(value: "video" | "reading" | "quiz") =>
                  setType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="reading">Lectura</SelectItem>
                  <SelectItem value="quiz">Examen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonDescription">Descripción</Label>
            <Textarea
              id="lessonDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la lección"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>

          {type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL del Video</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://ejemplo.com/video.mp4"
              />
            </div>
          )}

          {type === "reading" && (
            <div className="space-y-2">
              <Label htmlFor="readingContent">Contenido de Lectura</Label>
              <Textarea
                id="readingContent"
                value={readingContent}
                onChange={(e) => setReadingContent(e.target.value)}
                placeholder="Contenido del material de lectura..."
                rows={4}
              />
            </div>
          )}

          {type === "quiz" && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                El constructor de exámenes se abrirá después de crear la
                lección.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {lesson?.id ? "Actualizar" : "Crear"} Lección
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
