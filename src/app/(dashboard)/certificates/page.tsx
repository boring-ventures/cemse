"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  Download, 
  FileText, 
  GraduationCap, 
  Calendar,
  Star,
  CheckCircle,
  Loader2,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { useCertificates } from "@/hooks/useCertificates";
import { useEnrollments } from "@/hooks/useEnrollments";

interface ModuleCertificate {
  id: string;
  moduleId: string;
  studentId: string;
  certificateUrl: string;
  issuedAt: string;
  grade: number;
  completedAt: string;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CourseCertificate {
  id: string;
  userId: string;
  courseId: string;
  template: string;
  issuedAt: string;
  verificationCode: string;
  digitalSignature: string;
  isValid: boolean;
  url: string;
  course: {
    id: string;
    title: string;
    description?: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export default function CertificatesPage() {
  const {
    loading,
    error,
    downloading,
    loadModuleCertificates,
    loadCourseCertificates,
    downloadCertificate,
    previewCertificate,
    generateMissingCertificates,
    setError
  } = useCertificates();

  const { enrollments, loading: enrollmentsLoading } = useEnrollments();

  const [moduleCertificates, setModuleCertificates] = useState<ModuleCertificate[]>([]);
  const [courseCertificates, setCourseCertificates] = useState<CourseCertificate[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setIsInitialized(true);
      setError(null);
      
      // Cargar certificados de módulos
      const moduleCerts = await loadModuleCertificates();
      setModuleCertificates(moduleCerts);

      // Cargar certificados de cursos
      const courseCerts = await loadCourseCertificates();
      setCourseCertificates(courseCerts);

    } catch (err) {
      console.error('Error loading certificates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al cargar los certificados. Verifica tu conexión e inténtalo de nuevo.');
    }
  };

  const handleDownload = async (certificate: ModuleCertificate | CourseCertificate) => {
    try {
      const success = await downloadCertificate(certificate);
      if (!success) {
        alert('Error al descargar el certificado. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Error al descargar el certificado. Inténtalo de nuevo.');
    }
  };

  const handlePreview = async (certificate: ModuleCertificate | CourseCertificate) => {
    try {
      const success = await previewCertificate(certificate);
      if (!success) {
        alert('Error al previsualizar el certificado. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error previewing certificate:', err);
      alert('Error al previsualizar el certificado. Inténtalo de nuevo.');
    }
  };

  const handleGenerateMissing = async () => {
    try {
      const success = await generateMissingCertificates();
      if (success) {
        // Reload certificates after generation
        await loadCertificates();
      }
    } catch (err) {
      console.error('Error generating missing certificates:', err);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (grade >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const totalCertificates = moduleCertificates.length + courseCertificates.length;
  
  // Información sobre inscripciones
  const enrolledCourses = enrollments.filter(e => e.status === 'IN_PROGRESS' || e.status === 'COMPLETED');
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
                                                 <p className="text-gray-600 mt-1">
                  {totalCertificates} certificado{totalCertificates !== 1 ? 's' : ''} obtenido{totalCertificates !== 1 ? 's' : ''}
                </p>
                
                {/* Resumen de cursos inscritos */}
                {enrolledCourses.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">Resumen de Cursos</p>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>📚 Inscrito en: {enrolledCourses.length} curso{enrolledCourses.length !== 1 ? 's' : ''}</p>
                      <p>✅ Completados: {completedCourses.length} curso{completedCourses.length !== 1 ? 's' : ''}</p>
                      <p>🔄 En progreso: {enrolledCourses.length - completedCourses.length} curso{(enrolledCourses.length - completedCourses.length) !== 1 ? 's' : ''}</p>
                      <p>🏆 Certificados: {totalCertificates}</p>
                    </div>
                  </div>
                )}
                

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Cargando certificados...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error al cargar certificados
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadCertificates} className="bg-red-600 hover:bg-red-700">
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {!loading && !error && (
          <>
            {/* Resumen de cursos inscritos */}
            {enrolledCourses.length > 0 && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Mis Cursos</h3>
                      <p className="text-sm text-gray-600">Progreso de tus inscripciones</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourses.map((enrollment) => (
                      <div key={enrollment.id} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {enrollment.course.title}
                          </h4>
                          <Badge 
                            variant={enrollment.status === 'COMPLETED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {enrollment.status === 'COMPLETED' ? 'Completado' : 
                             enrollment.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Progreso</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => window.location.href = '/courses'}>
                      Ver Todos los Cursos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          <Tabs defaultValue="modules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Módulos ({moduleCertificates.length})
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Cursos Completos ({courseCertificates.length})
              </TabsTrigger>
            </TabsList>

            {/* Certificados de Módulos */}
            <TabsContent value="modules" className="space-y-6">
              {moduleCertificates.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No tienes certificados de módulos aún
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Completa módulos de cursos para obtener certificados individuales por cada módulo
                      </p>
                      <div className="space-y-2">
                        {enrolledCourses.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-600">
                              📚 Ya estás inscrito en {enrolledCourses.length} curso{enrolledCourses.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-gray-600">
                              Continúa estudiando para obtener certificados de módulos
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Primero inscríbete en un curso para comenzar a obtener certificados
                          </p>
                        )}
                        <Button variant="outline" onClick={() => window.location.href = '/courses'}>
                          {enrolledCourses.length > 0 ? 'Ver Mis Cursos' : 'Explorar Cursos'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moduleCertificates.map((certificate) => (
                    <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{certificate.module.title}</CardTitle>
                              <p className="text-sm text-gray-600">{certificate.module.course.title}</p>
                            </div>
                          </div>
                          <Badge className={getGradeColor(certificate.grade)}>
                            {certificate.grade}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Emitido: {formatDate(certificate.issuedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completado: {formatDate(certificate.completedAt)}</span>
                          </div>
                        </div>
                        
                                                 <div className="flex gap-2">
                           <Button 
                             onClick={() => handleDownload(certificate)}
                             disabled={downloading === certificate.id}
                             className="flex-1"
                           >
                             {downloading === certificate.id ? (
                               <>
                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                 Descargando...
                               </>
                             ) : (
                               <>
                                 <Download className="h-4 w-4 mr-2" />
                                 Descargar
                               </>
                             )}
                           </Button>
                           
                           <Button 
                             variant="outline"
                             onClick={() => handlePreview(certificate)}
                             disabled={downloading === certificate.id}
                             className="px-3"
                             title="Previsualizar"
                           >
                             <ExternalLink className="h-4 w-4" />
                           </Button>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Certificados de Cursos */}
            <TabsContent value="courses" className="space-y-6">
              {courseCertificates.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No tienes certificados de cursos completos aún
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Completa cursos enteros para obtener certificados oficiales de graduación
                      </p>
                      <div className="space-y-2">
                        {completedCourses.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm text-green-600">
                              ✅ Has completado {completedCourses.length} curso{completedCourses.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-gray-600">
                              Parece que tus certificados no se generaron automáticamente
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleGenerateMissing}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generando...
                                  </>
                                ) : (
                                  <>
                                    <Award className="h-4 w-4 mr-2" />
                                    Generar Certificados
                                  </>
                                )}
                              </Button>
                              <Button variant="outline" onClick={() => window.location.href = '/my-courses'}>
                                Ver Mis Cursos
                              </Button>
                            </div>
                          </div>
                        ) : enrolledCourses.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-blue-600">
                              📚 Tienes {enrolledCourses.length} curso{enrolledCourses.length !== 1 ? 's' : ''} en progreso
                            </p>
                            <p className="text-sm text-gray-600">
                              Completa todos los módulos para obtener tu certificado oficial
                            </p>
                            <Button variant="outline" onClick={() => window.location.href = '/my-courses'}>
                              Continuar Mis Cursos
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Inscríbete en cursos y completa todos los módulos para obtener certificados
                            </p>
                            <Button variant="outline" onClick={() => window.location.href = '/courses'}>
                              Explorar Cursos
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseCertificates.map((certificate) => (
                    <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{certificate.course.title}</CardTitle>
                              <p className="text-sm text-gray-600">Curso Completo</p>
                            </div>
                          </div>
                          <Badge variant={certificate.isValid ? "default" : "destructive"}>
                            {certificate.isValid ? "Válido" : "Inválido"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Emitido: {formatDate(certificate.issuedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="h-4 w-4" />
                            <span>Código: {certificate.verificationCode}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>Plantilla: {certificate.template}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleDownload(certificate)}
                            disabled={downloading === certificate.id}
                            className="flex-1"
                          >
                            {downloading === certificate.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Descargando...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline"
                            onClick={() => handlePreview(certificate)}
                            disabled={downloading === certificate.id}
                            className="px-3"
                            title="Previsualizar"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
