"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Play,
  FileText,
  Video,
  Clock,
  CheckCircle,
  Target,
  Users,
  BookOpen,
  Eye,
  FileVideo,
  FileImage,
  File,
  Download,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
} from "lucide-react";
import { useModuleLessons } from "@/hooks/useLessonApi";
import { useCourseModules } from "@/hooks/useCourseModuleApi";

export default function ModulePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;

  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Fetch module and lessons data
  const { data: modulesData, isLoading: modulesLoading } = useCourseModules(courseId);
  const { data: lessonsData, isLoading: lessonsLoading } = useModuleLessons(moduleId);

  const module = (modulesData as any)?.modules?.find((m: any) => m.id === moduleId);
  const lessons = (lessonsData as any)?.lessons || [];

  if (modulesLoading || lessonsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Módulo no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El módulo que buscas no existe o ha sido eliminado.
          </p>
          <Button asChild>
            <Link href={`/admin/courses/${courseId}/modules`}>
              Volver a Módulos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <Target className="h-4 w-4" />;
      case 'ASSIGNMENT':
        return <CheckCircle className="h-4 w-4" />;
      case 'LIVE':
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'Video';
      case 'TEXT':
        return 'Texto';
      case 'QUIZ':
        return 'Quiz';
      case 'ASSIGNMENT':
        return 'Asignación';
      case 'LIVE':
        return 'En Vivo';
      default:
        return 'Texto';
    }
  };

  const toggleLessonExpansion = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const getModuleStats = () => {
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.isPreview).length; // Mock completion
    const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    const previewLessons = lessons.filter(l => l.isPreview).length;

    return {
      totalLessons,
      completedLessons,
      totalDuration,
      previewLessons,
      completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  };

  const stats = getModuleStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={`/admin/courses/${courseId}/modules`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Módulos
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">👁️ Vista Previa de Módulo</h1>
            <p className="text-muted-foreground">
              Visualiza cómo verá el estudiante este módulo completo
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Modo Vista Previa
        </Badge>
      </div>

      {/* Module Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {module.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">
                    Módulo {module.orderIndex}
                  </Badge>
                  {module.isLocked ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Bloqueado
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      Disponible
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Module Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLessons}</div>
              <div className="text-sm text-blue-700">Lecciones</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedLessons}</div>
              <div className="text-sm text-green-700">Completadas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalDuration}</div>
              <div className="text-sm text-purple-700">Minutos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.previewLessons}</div>
              <div className="text-sm text-orange-700">Vista Previa</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso del módulo</span>
              <span>{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lecciones del Módulo ({lessons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay lecciones</h3>
              <p className="text-muted-foreground mb-4">
                Este módulo aún no tiene lecciones asignadas.
              </p>
              <Button asChild>
                <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons`}>
                  Crear Primera Lección
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <Collapsible
                  key={lesson.id}
                  open={expandedLessons.has(lesson.id)}
                  onOpenChange={() => toggleLessonExpansion(lesson.id)}
                >
                  <div className="border rounded-lg hover:bg-gray-50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(lesson.contentType)}
                            <div>
                              <h3 className="font-medium">{lesson.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{getContentTypeLabel(lesson.contentType)}</span>
                                <span>•</span>
                                <span>{lesson.duration || 0} min</span>
                                {lesson.isPreview && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="secondary" className="text-xs">
                                      Vista previa
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.isPreview && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Badge>
                          )}
                          {expandedLessons.has(lesson.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <Separator className="mb-4" />
                        
                        {/* Lesson Description */}
                        {lesson.description && (
                          <p className="text-muted-foreground mb-4">
                            {lesson.description}
                          </p>
                        )}

                        {/* Lesson Content Preview */}
                        {lesson.content && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Contenido:</h4>
                            <div 
                              className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto"
                              dangerouslySetInnerHTML={{ 
                                __html: lesson.content.length > 200 
                                  ? lesson.content.substring(0, 200) + '...' 
                                  : lesson.content 
                              }}
                            />
                          </div>
                        )}

                        {/* Video Preview */}
                        {lesson.contentType === 'VIDEO' && lesson.videoUrl && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Video:</h4>
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-md">
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                {lesson.duration || 0} min
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Attachments */}
                        {lesson.attachments && lesson.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Archivos adjuntos:</h4>
                            <div className="space-y-1">
                              {lesson.attachments.map((attachment: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <File className="h-4 w-4" />
                                  <span>{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/preview`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Vista Previa Completa
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/resources`}>
                              <Download className="h-4 w-4 mr-2" />
                              Recursos
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Navegación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}/modules`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Módulos
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons`}>
              <FileText className="h-4 w-4 mr-2" />
              Gestionar Lecciones
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}/preview`}>
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa del Curso Completo
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
