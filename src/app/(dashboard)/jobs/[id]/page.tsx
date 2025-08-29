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
  Share,
  Bookmark,
  BookmarkCheck,
  Building,
  Globe,
  Calendar,
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
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function JobDetailPage() {
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
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

  // Check if current user is the company that created this job
  // Temporarily show owner actions for any company user for testing
  const isCompanyUser = user && (user.role === "EMPRESAS" || user.role === "COMPANIES");
  const isJobOwner =
    user &&
    job &&
    (user.id === job.companyId ||
      (isCompanyUser && user.id === job.companyId) ||
      isCompanyUser); // Temporary: show for any company user

  // Debug logging
  console.log("🔍 Debug isJobOwner:", {
    userId: user?.id,
    userRole: user?.role,
    userCompany: user?.company,
    userCompanyId: user?.company?.id,
    jobCompanyId: job?.companyId,
    jobCompanyName: job?.company?.name,
    isJobOwner,
    isAuthenticated: !!user,
    comparison1: user?.id === job?.companyId,
    comparison2: isCompanyUser && user?.id === job?.companyId,
    fullUserObject: user,
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
        console.error("Error checking application status:", error);
        setApplicationStatus({
          hasApplied: false,
          loading: false,
        });
      }
    };

    checkApplicationStatus();
  }, [user, job]);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        console.log("🔍 JobDetailPage: Fetching job with ID:", jobId);

        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/joboffer/${jobId}`, {
          headers,
        });

        if (response.ok) {
          const jobData = await response.json();
          console.log("🔍 JobDetailPage: Job data received:", jobData);
          setJob(jobData);
        } else {
          console.error("Job not found");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

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

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save/unsave job functionality
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
      console.error("Error canceling application:", error);
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Mira esta oportunidad laboral: ${job?.title} en ${job?.company?.name || "Empresa"}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <Skeleton className="h-5 sm:h-6 w-3/4" />
                <Skeleton className="h-3 sm:h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-16 sm:h-20 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                  <Skeleton className="h-3 sm:h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <Skeleton className="h-32 sm:h-40 w-full" />
            <Skeleton className="h-48 sm:h-60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Empleo no encontrado
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Lo sentimos, no pudimos encontrar el empleo que buscas.
        </p>
        <Button onClick={() => router.push("/jobs")} size="sm">
          Volver a la búsqueda
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
        Volver a los resultados
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 flex-1">
                  <Avatar className="w-12 sm:w-16 h-12 sm:h-16 flex-shrink-0">
                    <AvatarImage
                      src={job.company?.logo}
                      alt={job.company?.name || "Empresa"}
                    />
                    <AvatarFallback className="text-sm sm:text-base">
                      {job.company?.name?.charAt(0) || "E"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {job.title}
                      {job.featured && (
                        <Star className="inline-block w-4 sm:w-5 h-4 sm:h-5 text-yellow-500 ml-1 sm:ml-2" />
                      )}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-3">
                      <span className="font-medium text-base sm:text-lg">
                        {job.company?.name || "Empresa"}
                      </span>
                      {job.company?.rating && (
                        <div className="flex items-center justify-center sm:justify-start gap-1">
                          <Star className="w-3 sm:w-4 h-3 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm sm:text-base">{job.company.rating}</span>
                          <span className="text-sm sm:text-base">({job.company.reviewCount} reseñas)</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>{getModalityLabel(job.workModality)}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>{job.applicationsCount} aplicaciones</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                        <span>{job.viewsCount} vistas</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center sm:justify-end gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span className="ml-1 sm:hidden">Compartir</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveJob}>
                    {isSaved ? (
                      <BookmarkCheck className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
                    ) : (
                      <Bookmark className="w-3 sm:w-4 h-3 sm:h-4" />
                    )}
                    <span className="ml-1 sm:hidden">Guardar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                <Badge variant="secondary" className="text-xs">
                  {getContractTypeLabel(job.contractType)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getExperienceLabel(job.experienceLevel)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Calendar className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span>Publicado el {formatDate(job.publishedAt)}</span>
                </div>
                {job.applicationDeadline && (
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Cierra el {formatDate(job.applicationDeadline)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Descripción del puesto</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="prose prose-sm sm:prose max-w-none">
                {job.description &&
                  job.description.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Requisitos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="prose prose-sm sm:prose max-w-none">
                  {job.requirements?.split("\n").map((requirement, index) => (
                    <p key={index} className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
                      {requirement}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Habilidades requeridas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
                    Habilidades esenciales
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {job.skillsRequired &&
                      job.skillsRequired.map((skill) => (
                        <Badge key={skill} variant="default" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
                {job.desiredSkills && job.desiredSkills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
                      Habilidades deseables
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {job.desiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Beneficios</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="prose prose-sm sm:prose max-w-none">
                  {job.benefits.split("\n").map((benefit, index) => (
                    <p key={index} className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
                      {benefit}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Apply Button - Only show if user is not the job owner */}
          {!isJobOwner && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                {applicationStatus.loading ? (
                  <Button className="w-full mb-3 sm:mb-4" size="lg" disabled>
                    <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin mr-2" />
                    <span className="text-sm sm:text-base">Verificando aplicación...</span>
                  </Button>
                ) : applicationStatus.hasApplied ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                      <Badge
                        className={`text-xs sm:text-sm ${getApplicationStatusColor(applicationStatus.application?.status || "")}`}
                      >
                        <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        {getApplicationStatusLabel(
                          applicationStatus.application?.status || ""
                        )}
                      </Badge>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
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
                      className="w-full text-sm sm:text-base"
                      size="lg"
                      variant="outline"
                    >
                      <XCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                      Cancelar Aplicación
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full mb-3 sm:mb-4 text-sm sm:text-base"
                    size="lg"
                  >
                    Aplicar a este empleo
                  </Button>
                )}
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {job.applicationsCount} personas ya aplicaron
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Owner Actions */}
          {isJobOwner && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    onClick={() => router.push(`/jobs/${jobId}/edit`)}
                    className="w-full text-sm sm:text-base"
                    variant="outline"
                  >
                    Editar Empleo
                  </Button>
                  <Button
                    onClick={() => router.push(`/jobs/${jobId}/candidates`)}
                    className="w-full text-sm sm:text-base"
                  >
                    Ver Candidatos
                  </Button>
                  <Button
                    onClick={() => router.push(`/jobs/${jobId}/questions`)}
                    className="w-full text-sm sm:text-base"
                    variant="outline"
                  >
                    Gestionar Preguntas
                  </Button>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">
                      {job.applicationsCount} aplicaciones recibidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {job.company && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Building className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span>Sobre la empresa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <Avatar className="w-10 sm:w-12 h-10 sm:h-12 flex-shrink-0">
                      <AvatarImage
                        src={job.company.logo}
                        alt={job.company.name}
                      />
                      <AvatarFallback className="text-sm">
                        {job.company.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <h3 className="font-medium text-sm sm:text-base">{job.company.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {job.company.size}
                      </p>
                    </div>
                  </div>

                  {job.company.images && job.company.images.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <CompanyGallery images={job.company.images} />
                    </div>
                  )}

                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      {job.company.description}
                    </p>
                  </div>

                  {job.company.website && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm">
                      <Globe className="w-3 sm:w-4 h-3 sm:h-4" />
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

          {/* Location Map */}
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

      {/* Job Application Modal */}
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
                // Refresh application status after successful application
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
