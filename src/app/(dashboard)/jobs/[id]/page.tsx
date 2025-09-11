"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Eye,
  Star,
  Building,
  Globe,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobApplicationForm from "@/components/jobs/job-application-form";
import { JobOffer } from "@/types/jobs";
import { CompanyGallery } from "@/components/jobs/company-gallery";
import { LocationMap } from "@/components/jobs/location-map";
import { useAuthContext } from "@/hooks/use-auth";
import { JobApplicationService } from "@/services/job-application.service";
import { useToast } from "@/hooks/use-toast";
import { useJobOffer } from "@/hooks/useJobOfferApi";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function JobDetailPage() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{
    hasApplied: boolean;
    application?: {
      id: string;
      status: string;
      appliedAt: string;
    };
    loading: boolean;
  }>({ hasApplied: false, loading: true });
  const { user, loading: authLoading } = useAuthContext();
  const { toast } = useToast();

  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  // Usar el hook apropiado para obtener datos del empleo
  const { data: job, isLoading: loading, error } = useJobOffer(jobId);

  // Registro de depuración
  console.log("🔍 JobDetailPage - ID del empleo:", jobId);
  console.log("🔍 JobDetailPage - cargando:", loading);
  console.log("🔍 JobDetailPage - error:", error);
  console.log("🔍 JobDetailPage - datos del empleo:", job);

  // Verificar si el usuario actual es la empresa que creó este empleo
  // Temporalmente mostrar acciones de propietario para cualquier usuario de empresa para pruebas
  const isCompanyUser =
    user && (user.role === "EMPRESAS" || user.role === "COMPANIES");
  const isJobOwner =
    user &&
    job &&
    (user.id === job.companyId ||
      (isCompanyUser && user.id === job.companyId) ||
      isCompanyUser); // Temporal: mostrar para cualquier usuario de empresa

  // Registro de depuración
  console.log("🔍 Debug esPropietario:", {
    idUsuario: user?.id,
    rolUsuario: user?.role,
    empresaUsuario: user?.company,
    idEmpresaUsuario: user?.company?.id,
    idEmpresaEmpleo: job?.companyId,
    nombreEmpresaEmpleo: job?.company?.name,
    esPropietario: isJobOwner,
    estaAutenticado: !!user,
    comparacion1: user?.id === job?.companyId,
    comparacion2: isCompanyUser && user?.id === job?.companyId,
    objetoUsuarioCompleto: user,
  });

  // Verificar si ya aplicaste a este trabajo
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !job) return;

      try {
        const result = await JobApplicationService.checkIfApplied(job.id);
        setApplicationStatus({
          hasApplied: result.hasApplied,
          application: result.application,
          loading: false,
        });
      } catch (error) {
        console.error("Error al verificar el estado de la aplicación:", error);
        setApplicationStatus({
          hasApplied: false,
          loading: false,
        });
      }
    };

    checkApplicationStatus();
  }, [user, job]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salario a convenir";
    if (min && max)
      return `Bs. ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `Desde Bs. ${min.toLocaleString()}`;
    return `Hasta Bs. ${max!.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Tiempo completo";
      case "PART_TIME":
        return "Medio tiempo";
      case "INTERNSHIP":
        return "Prácticas";
      case "VOLUNTEER":
        return "Voluntariado";
      case "FREELANCE":
        return "Freelance";
      default:
        return type;
    }
  };

  const getModalityLabel = (modality: string) => {
    switch (modality) {
      case "ON_SITE":
        return "Presencial";
      case "REMOTE":
        return "Remoto";
      case "HYBRID":
        return "Híbrido";
      default:
        return modality;
    }
  };

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case "NO_EXPERIENCE":
        return "Sin experiencia";
      case "ENTRY_LEVEL":
        return "Principiante";
      case "MID_LEVEL":
        return "Intermedio";
      case "SENIOR_LEVEL":
        return "Senior";
      default:
        return level;
    }
  };

  const getEducationLabel = (education: string) => {
    switch (education) {
      case "NO_EDUCATION":
        return "Sin educación formal";
      case "PRIMARY":
        return "Primaria";
      case "SECONDARY":
        return "Secundaria";
      case "HIGH_SCHOOL":
        return "Bachillerato";
      case "TECHNICAL":
        return "Técnico";
      case "UNIVERSITY":
        return "Universidad";
      case "POSTGRADUATE":
        return "Postgrado";
      case "MASTERS":
        return "Maestría";
      case "DOCTORATE":
        return "Doctorado";
      default:
        return education;
    }
  };

  const handleCancelApplication = async () => {
    if (!applicationStatus.application?.id) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la aplicación",
        variant: "destructive",
      });
      return;
    }

    try {
      await JobApplicationService.deleteApplication(
        applicationStatus.application.id
      );

      toast({
        title: "¡Aplicación cancelada!",
        description: "Tu aplicación ha sido cancelada exitosamente",
      });

      // Actualizar el estado
      setApplicationStatus({
        hasApplied: false,
        application: undefined,
        loading: false,
      });
    } catch (error) {
      console.error("Error al cancelar la aplicación:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la aplicación",
        variant: "destructive",
      });
    }
  };

  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case "SENT":
        return "Enviada";
      case "UNDER_REVIEW":
        return "En Revisión";
      case "PRE_SELECTED":
        return "Preseleccionado";
      case "REJECTED":
        return "Rechazado";
      case "HIRED":
        return "Contratado";
      default:
        return status;
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "PRE_SELECTED":
        return "bg-orange-100 text-orange-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "HIRED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-8">
            {/* Back Button Skeleton */}
            <Skeleton className="h-8 w-32" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Job Header Skeleton */}
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </CardContent>
                </Card>

                {/* Content Cards Skeleton */}
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-white shadow-sm border-0">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                {/* Application Card Skeleton */}
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </CardContent>
                </Card>

                {/* Company Card Skeleton */}
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>

                {/* Map Skeleton */}
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-red-100 rounded-full p-6 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Error al cargar el empleo
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              Lo sentimos, no pudimos cargar la información del empleo. Por
              favor, intenta nuevamente.
            </p>
            <Button
              onClick={() => router.push("/jobs")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a la búsqueda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <Info className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Empleo no encontrado
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              Lo sentimos, no pudimos encontrar el empleo que buscas. Puede que
              haya sido eliminado o no exista.
            </p>
            <Button
              onClick={() => router.push("/jobs")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a la búsqueda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Botón de Volver */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a los resultados
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encabezado del Empleo */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-16 h-16 bg-blue-100 flex-shrink-0">
                      <AvatarImage
                        src={job.logo}
                        alt={job.company?.name || "Empresa"}
                      />
                      <AvatarFallback className="text-blue-600 font-semibold text-lg">
                        {job.company?.name?.charAt(0) || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {job.title}
                        </h1>
                        {job.featured && (
                          <Star className="w-6 h-6 text-yellow-500 mt-1" />
                        )}
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-gray-900">
                            {job.company?.name || "Empresa"}
                          </span>
                          {job.company?.businessSector && (
                            <Badge variant="outline" className="text-xs">
                              {job.company.businessSector}
                            </Badge>
                          )}
                        </div>
                        {job.company?.companySize && (
                          <p className="text-sm text-gray-600">
                            {job.company.companySize}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{getModalityLabel(job.workModality)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{job.applicationsCount} aplicaciones</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{job.viewsCount} vistas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                    {getContractTypeLabel(job.contractType)}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    {getExperienceLabel(job.experienceLevel)}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Publicado el {formatDate(job.publishedAt)}</span>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        Cierra el {formatDate(job.applicationDeadline)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Descripción del Empleo */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4 p-6">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Descripción del puesto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="prose prose-gray max-w-none">
                  {job.description &&
                    job.description.split("\n").map((paragraph, index) => (
                      <p
                        key={index}
                        className="mb-4 text-base text-gray-700 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Requisitos */}
            {job.requirements && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4 p-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Requisitos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="prose prose-gray max-w-none">
                    {job.requirements?.split("\n").map((requirement, index) => (
                      <p
                        key={index}
                        className="mb-4 text-base text-gray-700 leading-relaxed"
                      >
                        {requirement}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Habilidades */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4 p-6">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Habilidades requeridas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-base text-gray-900 mb-3">
                      Habilidades esenciales
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired &&
                        job.skillsRequired.map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm"
                          >
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  {job.desiredSkills && job.desiredSkills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-base text-gray-900 mb-3">
                        Habilidades deseables
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.desiredSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="px-3 py-1 text-sm border-gray-200 text-gray-700"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Beneficios */}
            {job.benefits && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4 p-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Beneficios
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="prose prose-gray max-w-none">
                    {job.benefits.split("\n").map((benefit, index) => (
                      <p
                        key={index}
                        className="mb-4 text-base text-gray-700 leading-relaxed"
                      >
                        {benefit}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Horario del Empleo e Información Adicional */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4 p-6">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Horario y Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Horario de trabajo
                    </h4>
                    <p className="text-sm text-gray-600">
                      {job.workSchedule || "No especificado"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Educación requerida
                    </h4>
                    <p className="text-sm text-gray-600">
                      {job.educationRequired
                        ? getEducationLabel(job.educationRequired)
                        : "No especificada"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Municipio
                    </h4>
                    <p className="text-sm text-gray-600">
                      {job.municipality || "No especificado"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Departamento
                    </h4>
                    <p className="text-sm text-gray-600">
                      {job.department || "No especificado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra Lateral */}
          <div className="space-y-6">
            {/* Botón de Aplicar - Solo mostrar si el usuario no es el propietario del empleo */}
            {!isJobOwner && (
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-6">
                  {applicationStatus.loading ? (
                    <Button className="w-full mb-4" size="lg" disabled>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-base">
                        Verificando aplicación...
                      </span>
                    </Button>
                  ) : applicationStatus.hasApplied ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge
                          className={`text-sm px-4 py-2 ${getApplicationStatusColor(applicationStatus.application?.status || "")}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {getApplicationStatusLabel(
                            applicationStatus.application?.status || ""
                          )}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-3">
                          Aplicaste el{" "}
                          {applicationStatus.application?.appliedAt
                            ? new Date(
                                applicationStatus.application.appliedAt
                              ).toLocaleDateString("es-ES")
                            : "Fecha no disponible"}
                        </p>
                      </div>
                      <Button
                        onClick={handleCancelApplication}
                        className="w-full text-base"
                        size="lg"
                        variant="outline"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancelar Aplicación
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowApplicationModal(true)}
                      className="w-full mb-4 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      size="lg"
                    >
                      Aplicar a este empleo
                    </Button>
                  )}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {job.applicationsCount} personas ya aplicaron
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones del Propietario del Empleo */}
            {isJobOwner && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4 p-6">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Gestionar Empleo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push(`/jobs/${jobId}/edit`)}
                      className="w-full text-base"
                      variant="outline"
                    >
                      Editar Empleo
                    </Button>
                    <Button
                      onClick={() => router.push(`/jobs/${jobId}/candidates`)}
                      className="w-full text-base bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Ver Candidatos
                    </Button>
                    <Button
                      onClick={() => router.push(`/jobs/${jobId}/questions`)}
                      className="w-full text-base"
                      variant="outline"
                    >
                      Gestionar Preguntas
                    </Button>
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-600">
                        {job.applicationsCount} aplicaciones recibidas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información de la Empresa */}
            {job.company && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4 p-6">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Sobre la empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 bg-blue-100 flex-shrink-0">
                        <AvatarImage src={job.logo} alt={job.company.name} />
                        <AvatarFallback className="text-blue-600 font-semibold">
                          {job.company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-base text-gray-900">
                          {job.company.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {job.company.companySize}
                        </p>
                      </div>
                    </div>

                    {job.images && job.images.length > 0 && (
                      <div className="mt-4">
                        <CompanyGallery images={job.images} />
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {job.company.description}
                      </p>
                    </div>

                    {job.company.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {job.company.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mapa de Ubicación */}
            <div className="w-full">
              <LocationMap
                latitude={job.latitude}
                longitude={job.longitude}
                location={job.location}
                companyName={job.company?.name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Aplicación al Empleo */}
      <Dialog
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aplicar a: {job?.title}</DialogTitle>
            <DialogDescription>
              Completa el formulario para aplicar a este empleo
            </DialogDescription>
          </DialogHeader>

          {job && (
            <JobApplicationForm
              jobOffer={job}
              onSuccess={() => {
                setShowApplicationModal(false);
                toast({
                  title: "¡Aplicación enviada!",
                  description: "Tu aplicación ha sido enviada exitosamente.",
                });
                // Actualizar estado de aplicación después de aplicación exitosa
                JobApplicationService.checkIfApplied(job.id).then((result) => {
                  setApplicationStatus({
                    hasApplied: result.hasApplied,
                    application: result.application,
                    loading: false,
                  });
                });
              }}
              onCancel={() => setShowApplicationModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
