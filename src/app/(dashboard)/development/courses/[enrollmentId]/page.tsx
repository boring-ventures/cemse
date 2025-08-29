"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  User, 
  Building2,
  Play,
  CheckCircle,
  Award,
  Calendar,
  Target,
  Loader2
} from "lucide-react";
import { useCourseEnrollments } from "@/hooks/useCourseEnrollments";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.enrollmentId as string;
  
  const { getEnrollmentById } = useCourseEnrollments();
  
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 CoursePage: useEffect triggered with enrollmentId:', enrollmentId);
    
    const loadCourseData = async () => {
      try {
        setLoading(true);
        console.log('🔍 CoursePage: Loading enrollment with ID:', enrollmentId);
        
        // Solo cargar datos de la inscripción
        const enrollmentData = await getEnrollmentById(enrollmentId);
        console.log('🔍 CoursePage: Enrollment data:', enrollmentData);
        
        if (!enrollmentData) {
          throw new Error('No se encontró la inscripción al curso');
        }
        setEnrollment(enrollmentData);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el curso';
        setError(errorMessage);
        console.error('Error loading course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (enrollmentId) {
      loadCourseData();
    }
  }, [enrollmentId]); // Solo depende de enrollmentId



  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando información del curso...</p>
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
              <p className="text-red-600 mb-4">{error || 'Error al cargar el curso'}</p>
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

  // Calcular estadísticas reales del curso
  const totalLessons = course.modules?.reduce((total: number, module: any) => 
    total + (module.lessons?.length || 0), 0) || 0;
  
  const totalModules = course.modules?.length || 0;
  const modulesWithLessons = course.modules?.filter((module: any) => 
    module.lessons && module.lessons.length > 0).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal - Información del Curso */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Información del Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">{formatDuration(course.duration)}</div>
                    <div className="text-xs text-muted-foreground">Duración</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">{totalLessons}</div>
                    <div className="text-xs text-muted-foreground">Lecciones</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">{totalModules}</div>
                    <div className="text-xs text-muted-foreground">Módulos</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <User className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-medium">{course.instructor?.name || 'No especificado'}</div>
                    <div className="text-xs text-muted-foreground">Instructor</div>
                  </div>
                </div>

                {/* Información adicional del curso */}
                <div className="mt-6 space-y-4">
                  {course.objectives && course.objectives.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Objetivos del Curso:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {course.objectives.map((objective: any, index: number) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Prerrequisitos:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {course.prerequisites.map((prereq: any, index: number) => (
                          <li key={index}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.tags && course.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Etiquetas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Módulos del Curso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Módulos del Curso ({totalModules})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules && course.modules.length > 0 ? (
                    course.modules.map((module: any, index: number) => (
                      <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">
                              Módulo {module.orderIndex}: {module.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.estimatedDuration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {module.lessons?.length || 0} lecciones
                              </span>
                              {module.hasCertificate && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Award className="h-3 w-3" />
                                  Certificado
                                </span>
                              )}
                            </div>

                            {/* Lecciones del módulo */}
                            {module.lessons && module.lessons.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {module.lessons.map((lesson: any, lessonIndex: number) => (
                                  <div key={lesson.id} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>{lesson.title}</span>
                                    <span className="text-muted-foreground">({lesson.duration} min)</span>
                                    {lesson.contentType === 'VIDEO' && (
                                      <Badge variant="outline" className="text-xs">Video</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Comenzar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No hay módulos disponibles en este curso.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral - Estado y Progreso */}
          <div className="space-y-6">
            {/* Enrollment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mi Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {enrollment.status === 'ENROLLED' ? 'Inscrito' : 
                       enrollment.status === 'IN_PROGRESS' ? 'En Progreso' :
                       enrollment.status === 'COMPLETED' ? 'Completado' : enrollment.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progreso:</span>
                    <span className="text-sm">{enrollment.progress || 0}%</span>
                  </div>
                  
                  <Progress value={enrollment.progress || 0} className="w-full" />
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Inscrito:</span>
                      <span>{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>
                    {enrollment.startedAt && (
                      <div className="flex justify-between">
                        <span>Iniciado:</span>
                        <span>{new Date(enrollment.startedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {enrollment.completedAt && (
                      <div className="flex justify-between">
                        <span>Completado:</span>
                        <span>{new Date(enrollment.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {enrollment.timeSpent > 0 && (
                      <div className="flex justify-between">
                        <span>Tiempo:</span>
                        <span>{formatDuration(enrollment.timeSpent)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => router.push(`/development/courses/${enrollmentId}/learn`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Comenzar Aprendizaje
                      </Button>
                      
                      <Button variant="outline" className="w-full" disabled>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Ya estás en los detalles del curso
                      </Button>
                      
                      {enrollment.certificateIssued && (
                        <Button variant="outline" className="w-full">
                          <Award className="h-4 w-4 mr-2" />
                          Descargar Certificado
                        </Button>
                      )}
                    </div>
              </CardContent>
            </Card>

            {/* Información del Estudiante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mi Información
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{enrollment.student?.firstName} {enrollment.student?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rol:</span>
                      <span>{enrollment.student?.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Institución:</span>
                      <span>{enrollment.student?.currentInstitution || 'No especificada'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
