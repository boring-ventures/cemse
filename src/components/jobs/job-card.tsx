"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  Eye,
  Star,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobApplicationForm from "@/components/jobs/job-application-form";
import { JobOffer } from "@/types/jobs";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { JobApplicationService } from "@/services/job-application.service";
import { useToast } from "@/hooks/use-toast";

interface JobCardProps {
  job: JobOffer;
  viewMode: "grid" | "list";
}

export const JobCard = ({ job, viewMode }: JobCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{
    hasApplied: boolean;
    application?: any;
    loading: boolean;
  }>({ hasApplied: false, loading: true });
  const router = useRouter();
  const { toast } = useToast();

  // Verificar si ya aplicaste a este trabajo
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const result = await JobApplicationService.checkIfApplied(job.id);
        setApplicationStatus({
          hasApplied: result.hasApplied,
          application: result.application,
          loading: false
        });
      } catch (error) {
        console.error('Error checking application status:', error);
        setApplicationStatus({
          hasApplied: false,
          loading: false
        });
      }
    };

    checkApplicationStatus();
  }, [job.id]);

  const expiresAt = job.expiresAt
    ? new Date(job.expiresAt)
    : new Date(new Date(job.publishedAt).getTime() + 15 * 24 * 60 * 60 * 1000);
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salario a convenir";
    if (min && max)
      return `Bs. ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `Desde Bs. ${min.toLocaleString()}`;
    return `Hasta Bs. ${max!.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hace 1 día";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return `Hace ${Math.ceil(diffDays / 30)} meses`;
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

  const handleSaveJob = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    // TODO: Implement save/unsave job functionality
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowApplicationModal(true);
  };

  const handleCancelApplication = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!applicationStatus.application?.id) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la aplicación",
        variant: "destructive"
      });
      return;
    }

    try {
      await JobApplicationService.deleteApplication(applicationStatus.application.id);
      
      toast({
        title: "¡Aplicación cancelada!",
        description: "Tu aplicación ha sido cancelada exitosamente"
      });

      // Actualizar el estado
      setApplicationStatus({
        hasApplied: false,
        application: undefined,
        loading: false
      });
    } catch (error) {
      console.error('Error canceling application:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la aplicación",
        variant: "destructive"
      });
    }
  };

  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'Enviada';
      case 'UNDER_REVIEW':
        return 'En Revisión';
      case 'PRE_SELECTED':
        return 'Preseleccionado';
      case 'REJECTED':
        return 'Rechazado';
      case 'HIRED':
        return 'Contratado';
      default:
        return status;
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'PRE_SELECTED':
        return 'bg-orange-100 text-orange-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (viewMode === "list") {
    return (
      <Link href={`/jobs/${job.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <Avatar className="w-10 sm:w-12 h-10 sm:h-12 flex-shrink-0 mx-auto sm:mx-0">
                <AvatarImage
                  src={job.company?.logo || "/images/companies/default-logo.png"}
                  alt={job.company?.name || "Empresa"}
                />
                <AvatarFallback>
                  {job.company?.name?.charAt(0) || "E"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                        {job.featured && (
                          <Star className="inline-block w-3 sm:w-4 h-3 sm:h-4 text-yellow-500 ml-1 sm:ml-2" />
                        )}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                        <span className="font-medium">
                          {job.company?.name || "Empresa"}
                        </span>
                        {job.company?.rating && (
                          <div className="flex items-center justify-center sm:justify-start gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{job.company.rating}</span>
                            <span>({job.company.reviewCount || 0})</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
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
                          <span>{job.applicationCount || 0} aplicaciones</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-1">
                          <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span>{job.viewCount || 0} vistas</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-2 text-center sm:text-left">
                        {truncateText(job.description, 150)}
                      </p>

                      <div className="flex items-center justify-center sm:justify-start flex-wrap gap-1 sm:gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {getContractTypeLabel(job.contractType)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getExperienceLabel(job.experienceLevel)}
                        </Badge>
                        {job.requiredSkills?.slice(0, 2).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.requiredSkills && job.requiredSkills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requiredSkills.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-2 sm:gap-3 w-full sm:w-auto lg:ml-4">
                    <div className="text-center lg:text-right">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">
                        {formatSalary(
                          job.salaryMin,
                          job.salaryMax,
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formatDate(job.publishedAt)}
                      </p>
                      {expiresAt && (
                        <p className="text-xs sm:text-sm text-gray-400 flex items-center justify-center lg:justify-end">
                          <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Vence el{" "}
                          {format(expiresAt, "dd 'de' MMMM", {
                            locale: es,
                          })}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveJob}
                        className="w-8 sm:w-10 h-8 sm:h-10 p-0"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
                        ) : (
                          <Bookmark className="w-3 sm:w-4 h-3 sm:h-4" />
                        )}
                      </Button>
                      
                      {applicationStatus.loading ? (
                        <Button size="sm" className="flex-1 sm:min-w-[80px] sm:flex-none" disabled>
                          <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                        </Button>
                      ) : applicationStatus.hasApplied ? (
                        <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                          <Badge className={`text-xs justify-center ${getApplicationStatusColor(applicationStatus.application?.status)}`}>
                            {getApplicationStatusLabel(applicationStatus.application?.status)}
                          </Badge>
                          <Button
                            onClick={handleCancelApplication}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleApplyClick}
                          size="sm"
                          className="flex-1 sm:min-w-[80px] sm:flex-none text-xs sm:text-sm"
                        >
                          Aplicar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Grid view
  return (
    <>
      <Link href={`/jobs/${job.id}`}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <Avatar className="w-8 sm:w-10 h-8 sm:h-10 flex-shrink-0">
                  <AvatarImage src={job.company?.logo || "/images/companies/default-logo.png"} alt={job.company?.name || "Empresa"} />
                  <AvatarFallback className="text-xs sm:text-sm">{job.company?.name?.charAt(0) || "E"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                    {job.title}
                    {job.featured && (
                      <Star className="inline-block w-3 sm:w-4 h-3 sm:h-4 text-yellow-500 ml-1 sm:ml-2" />
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                    {job.company?.name || "Empresa"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveJob}
                className="w-6 sm:w-8 h-6 sm:h-8 p-0 ml-1 sm:ml-2 flex-shrink-0"
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-3 sm:w-4 h-3 sm:h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getModalityLabel(job.workModality)}</span>
                </div>
              </div>

              <p className="text-gray-700 text-xs sm:text-sm line-clamp-3">
                {truncateText(job.description, 100)}
              </p>

              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getContractTypeLabel(job.contractType)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getExperienceLabel(job.experienceLevel)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {job.requiredSkills?.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.requiredSkills && job.requiredSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.requiredSkills.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t gap-2 sm:gap-0">
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {formatSalary(
                      job.salaryMin,
                      job.salaryMax,
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(job.publishedAt)}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Vence el {format(expiresAt, "dd 'de' MMMM", { locale: es })}
                  </p>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{job.applicationCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{job.viewCount || 0}</span>
                  </div>
                </div>
              </div>

              {applicationStatus.loading ? (
                <Button className="w-full" size="sm" disabled>
                  <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin mr-2" />
                  <span className="text-xs sm:text-sm">Cargando...</span>
                </Button>
              ) : applicationStatus.hasApplied ? (
                <div className="space-y-2">
                  <Badge className={`w-full justify-center text-xs ${getApplicationStatusColor(applicationStatus.application?.status)}`}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {getApplicationStatusLabel(applicationStatus.application?.status)}
                  </Badge>
                  <Button 
                    onClick={handleCancelApplication} 
                    className="w-full" 
                    size="sm" 
                    variant="outline"
                  >
                    <XCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">Cancelar Aplicación</span>
                  </Button>
                </div>
              ) : (
                <Button onClick={handleApplyClick} className="w-full" size="sm">
                  <span className="text-xs sm:text-sm">Aplicar ahora</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Job Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-8">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Aplicar a: {job.title}</DialogTitle>
            <DialogDescription className="text-sm">
              Completa el formulario para aplicar a este empleo
            </DialogDescription>
          </DialogHeader>
          
          <JobApplicationForm
            jobOffer={job}
            onSuccess={() => {
              setShowApplicationModal(false);
              toast({
                title: "¡Aplicación enviada!",
                description: "Tu aplicación ha sido enviada exitosamente."
              });
              // Refresh application status after successful application
              JobApplicationService.checkIfApplied(job.id).then(result => {
                setApplicationStatus({
                  hasApplied: result.hasApplied,
                  application: result.application,
                  loading: false
                });
              });
            }}
            onCancel={() => setShowApplicationModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
