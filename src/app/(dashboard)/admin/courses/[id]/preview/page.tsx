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
  Star,
  Award,
  Calendar,
  BarChart3,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { useCourseModules } from "@/hooks/useCourseModuleApi";
import { useModuleLessons } from "@/hooks/useLessonApi";

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Fetch course and modules data
  const { data: modulesData, isLoading: modulesLoading } = useCourseModules(courseId);

  const modules = modulesData?.modules || [];

  if (modulesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-96 bg-gray-200 rounded" />
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

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
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

  const getCourseStats = () => {
    const totalModules = modules.length;
    const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
    const totalDuration = modules.reduce((sum, module) => {
      return sum + (module.lessons?.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0) || 0);
    }, 0);
    const previewLessons = modules.reduce((sum, module) => {
      return sum + (module.lessons?.filter(lesson => lesson.isPreview).length || 0);
    }, 0);

    return {
      totalModules,
      totalLessons,
      totalDuration,
      previewLessons,
      completionRate: totalLessons > 0 ? Math.round((previewLessons / totalLessons) * 100) : 0
    };
  };

  const stats = getCourseStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href={`/admin/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">👁️ Vista Previa del Curso</h1>
            <p className="text-muted-foreground">
              Visualiza cómo verá el estudiante el curso completo
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Modo Vista Previa
        </Badge>
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">Curso Completo</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Vista previa de toda la estructura del curso
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {stats.totalModules} Módulos
                  </Badge>
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {stats.totalLessons} Lecciones
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.totalDuration} Minutos
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalModules}</div>
              <div className="text-sm text-blue-700">Módulos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalLessons}</div>
              <div className="text-sm text-green-700">Lecciones</div>
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
              <span>Progreso general del curso</span>
              <span>{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Course Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estructura del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay módulos</h3>
              <p className="text-muted-foreground mb-4">
                Este curso aún no tiene módulos asignados.
              </p>
              <Button asChild>
                <Link href={`/admin/courses/${courseId}/modules`}>
                  Crear Primer Módulo
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <Collapsible
                  key={module.id}
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModuleExpansion(module.id)}
                >
                  <div className="border rounded-lg hover:bg-gray-50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
                            {moduleIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{module.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{module.lessons?.length || 0} lecciones</span>
                              <span>•</span>
                              <span>{module.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0} min</span>
                              {module.isLocked ? (
                                <>
                                  <span>•</span>
                                  <Badge variant="destructive" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Bloqueado
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <span>•</span>
                                  <Badge variant="default" className="text-xs">
                                    <Unlock className="h-3 w-3 mr-1" />
                                    Disponible
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedModules.has(module.id) ? (
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
                        
                        {/* Module Description */}
                        {module.description && (
                          <p className="text-muted-foreground mb-4">
                            {module.description}
                          </p>
                        )}

                        {/* Module Lessons */}
                        {module.lessons && module.lessons.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="font-medium mb-3">Lecciones del módulo:</h4>
                            {module.lessons.map((lesson, lessonIndex) => (
                              <Collapsible
                                key={lesson.id}
                                open={expandedLessons.has(lesson.id)}
                                onOpenChange={() => toggleLessonExpansion(lesson.id)}
                              >
                                <div className="border rounded-lg hover:bg-gray-50 transition-colors ml-4">
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-3 cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                                          {lessonIndex + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getContentTypeIcon(lesson.contentType)}
                                          <div>
                                            <h4 className="font-medium text-sm">{lesson.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              <span>{getContentTypeLabel(lesson.contentType)}</span>
                                              <span>•</span>
                                              <span>{lesson.duration || 0} min</span>
                                              {lesson.isPreview && (
                                                <>
                                                  <span>•</span>
                                                  <span className="inline-flex">
                                                    <Badge variant="secondary" className="text-xs">
                                                      Vista previa
                                                    </Badge>
                                                  </span>
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
                                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        )}
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent>
                                    <div className="px-3 pb-3">
                                      <Separator className="mb-3" />
                                      
                                      {/* Lesson Description */}
                                      {lesson.description && (
                                        <p className="text-muted-foreground text-sm mb-3">
                                          {lesson.description}
                                        </p>
                                      )}

                                      {/* Lesson Content Preview */}
                                      {lesson.content && (
                                        <div className="mb-3">
                                          <h5 className="font-medium text-sm mb-2">Contenido:</h5>
                                          <div 
                                            className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg max-h-24 overflow-y-auto"
                                            dangerouslySetInnerHTML={{ 
                                              __html: lesson.content.length > 150 
                                                ? lesson.content.substring(0, 150) + '...' 
                                                : lesson.content 
                                            }}
                                          />
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                          <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/preview`}>
                                            <Eye className="h-3 w-3 mr-1" />
                                            Vista Previa
                                          </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                          <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/resources`}>
                                            <Download className="h-3 w-3 mr-1" />
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
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              Este módulo no tiene lecciones asignadas.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2" asChild>
                              <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
                                Crear Lección
                              </Link>
                            </Button>
                          </div>
                        )}

                        {/* Module Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/courses/${courseId}/modules/${module.id}/preview`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Vista Previa del Módulo
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Gestionar Lecciones
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

      {/* Course Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Características del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Videos HD</h4>
                <p className="text-sm text-muted-foreground">Calidad profesional</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Recursos Descargables</h4>
                <p className="text-sm text-muted-foreground">Material complementario</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Evaluaciones</h4>
                <p className="text-sm text-muted-foreground">Quizzes y exámenes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Certificado</h4>
                <p className="text-sm text-muted-foreground">Al completar el curso</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Acceso de por vida</h4>
                <p className="text-sm text-muted-foreground">Sin límites de tiempo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-medium">Soporte</h4>
                <p className="text-sm text-muted-foreground">Comunidad activa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Navegación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}/modules`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Gestionar Módulos
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}/progress`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Progreso
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href={`/admin/courses/${courseId}/certificates`}>
              <Award className="h-4 w-4 mr-2" />
              Gestionar Certificados
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
