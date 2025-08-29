"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Course } from "@/types/api";
import { CourseCategory, CourseLevel } from "@/types/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Star,
  Award,
  Play,
  Edit,
  Settings,
  BarChart3,
  Layers,
  GraduationCap,
  Target,
  CheckCircle,
  FileText,
  Download,
  Calendar,
  User,
} from "lucide-react";
import { useCourse } from "@/hooks/useCourseApi";
import { useCourseModules } from "@/hooks/useCourseModuleApi";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const { data: courseData, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: modulesData, isLoading: modulesLoading } = useCourseModules(courseId);
  
  const course = courseData?.course;
  const modules = (modulesData as any)?.modules || [];

  const getCategoryLabel = (category: string) => {
    const labels = {
      [CourseCategory.SOFT_SKILLS]: "Habilidades Blandas",
      [CourseCategory.BASIC_COMPETENCIES]: "Competencias Básicas", 
      [CourseCategory.JOB_PLACEMENT]: "Inserción Laboral",
      [CourseCategory.ENTREPRENEURSHIP]: "Emprendimiento",
      [CourseCategory.TECHNICAL_SKILLS]: "Habilidades Técnicas",
      [CourseCategory.DIGITAL_LITERACY]: "Alfabetización Digital",
      [CourseCategory.COMMUNICATION]: "Comunicación",
      [CourseCategory.LEADERSHIP]: "Liderazgo",
    };
    return labels[category as CourseCategory] || category;
  };

  const getLevelLabel = (level: string) => {
    const labels = {
      [CourseLevel.BEGINNER]: "Principiante",
      [CourseLevel.INTERMEDIATE]: "Intermedio", 
      [CourseLevel.ADVANCED]: "Avanzado",
    };
    return labels[level as CourseLevel] || level;
  };

  if (courseLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Curso no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El curso que buscas no existe o no tienes permisos para verlo.
          </p>
          <Button asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Cursos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.shortDescription}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/courses/${courseId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/courses/${courseId}/preview`}>
              <Play className="h-4 w-4 mr-2" />
              Vista Previa
            </Link>
          </Button>
        </div>
      </div>

      {/* Course Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course Image */}
            <div className="w-full md:w-64 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="h-16 w-16 text-white" />
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {getCategoryLabel(course.category)}
                </Badge>
                <Badge variant="secondary">
                  {getLevelLabel(course.level)}
                </Badge>
                <Badge variant={course.isActive ? "default" : "secondary"}>
                  {course.isActive ? "Activo" : "Inactivo"}
                </Badge>
                {course.isMandatory && (
                  <Badge variant="destructive">Obligatorio</Badge>
                )}
                {course.certification && (
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    Certificado
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.studentsCount || 0} estudiantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration || 0} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{Number(course.rating || 0).toFixed(1)} rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{Number(course.completionRate || 0).toFixed(1)}% completan</span>
                </div>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{course.instructor.name}</div>
                    <div className="text-sm text-muted-foreground">{course.instructor.title}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">
              {course.totalLessons || 0} lecciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.totalResources || 0}</div>
            <p className="text-xs text-muted-foreground">
              PDFs, videos, documentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.totalQuizzes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Quizzes y exámenes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(course.price || 0) === 0 ? "Gratis" : `$${Number(course.price).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {course.certification ? "Con certificado" : "Sin certificado"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="modules">Módulos ({modules.length})</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Detalles del Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Institución:</span>
                    <div className="font-medium">{course.institutionName || "CEMSE"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duración:</span>
                    <div className="font-medium">{Math.floor((course.duration || 0) / 60)}h {(course.duration || 0) % 60}m</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Creado:</span>
                    <div className="font-medium">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actualizado:</span>
                    <div className="font-medium">
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Objectives */}
          {course.objectives && course.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites & Materials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos Previos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {course.includedMaterials && course.includedMaterials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Materiales Incluidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.includedMaterials.map((material, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Download className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Módulos del Curso</h3>
            <Button asChild>
              <Link href={`/admin/courses/${courseId}/modules`}>
                <Layers className="h-4 w-4 mr-2" />
                Gestionar Módulos
              </Link>
            </Button>
          </div>

          {modulesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((module: any, index: number) => (
                <Card key={module.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{module.title}</h4>
                          {module.description && (
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{module.lessons?.length || 0} lecciones</span>
                            <span>{module.estimatedDuration || 0} min</span>
                            {module.hasCertificate && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                Certificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${courseId}/modules/${module.id}`}>
                          Ver Módulo
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay módulos</h3>
                <p className="text-muted-foreground mb-4">
                  Este curso aún no tiene módulos creados.
                </p>
                <Button asChild>
                  <Link href={`/admin/courses/${courseId}/modules`}>
                    <Layers className="h-4 w-4 mr-2" />
                    Crear Primer Módulo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestión de Estudiantes</h3>
              <p className="text-muted-foreground mb-4">
                Ver y gestionar los estudiantes inscritos en este curso.
              </p>
              <Button asChild>
                <Link href={`/admin/courses/${courseId}/students`}>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Estudiantes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analíticas del Curso</h3>
              <p className="text-muted-foreground mb-4">
                Visualiza métricas detalladas sobre el rendimiento del curso.
              </p>
              <Button asChild>
                <Link href={`/admin/courses/${courseId}/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Analíticas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
