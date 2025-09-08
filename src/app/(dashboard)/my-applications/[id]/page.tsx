"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Download,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  Users,
  FileText,
  Building,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useYouthApplication } from "@/hooks/use-youth-applications";
import { API_BASE } from "@/lib/api";
import { YouthApplicationService } from "@/services/youth-application.service";
import CompanyInterestsList from "@/components/youth-applications/CompanyInterestsList";
import YouthApplicationChat from "@/components/youth-applications/YouthApplicationChat";

export default function YouthApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const {
    data: application,
    isLoading,
    error,
  } = useYouthApplication(applicationId);

  const [activeTab, setActiveTab] = useState<
    "details" | "messages" | "interests"
  >("details");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Eye className="w-4 h-4 text-green-600" />;
      case "PAUSED":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case "CLOSED":
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case "HIRED":
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activa";
      case "PAUSED":
        return "Pausada";
      case "CLOSED":
        return "Cerrada";
      case "HIRED":
        return "Contratado";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-orange-100 text-orange-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      case "HIRED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!application) return;

    if (confirm("¿Estás seguro de que quieres eliminar esta postulación?")) {
      try {
        await YouthApplicationService.deleteYouthApplication(application.id);
        toast({
          title: "Postulación eliminada",
          description: "La postulación ha sido eliminada exitosamente",
        });
        router.push("/my-youth-applications");
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la postulación",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-20 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Postulación no encontrada
            </h3>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              La postulación que buscas no existe o no tienes permisos para
              verla.
            </p>
            <Button
              onClick={() => router.push("/my-youth-applications")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Mis Postulaciones
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {application.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    Creada el {formatDate(application.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {application.viewsCount || 0} vistas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {application.applicationsCount || 0} intereses
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                className={`${getStatusColor(application.status)} border-0 px-4 py-2`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(application.status)}
                  <span className="font-medium">
                    {getStatusLabel(application.status)}
                  </span>
                </div>
              </Badge>
              <Badge
                variant={application.isPublic ? "default" : "secondary"}
                className="px-4 py-2"
              >
                {application.isPublic ? "Pública" : "Privada"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "details"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detalles
                </div>
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "messages"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Mensajes
                </div>
              </button>
              <button
                onClick={() => setActiveTab("interests")}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "interests"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Intereses de Empresas
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Description */}
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Descripción
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                        {application.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card className="bg-white shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Download className="w-5 h-5 text-green-600" />
                      Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {application.cvFile && (
                        <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">CV</p>
                              <p className="text-sm text-gray-500">
                                {application.cvFile.split("/").pop()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `${API_BASE.replace("/api", "")}${application.cvFile}`,
                                "_blank"
                              )
                            }
                            className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Ver CV
                          </Button>
                        </div>
                      )}

                      {application.coverLetterFile && (
                        <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                Carta de Presentación
                              </p>
                              <p className="text-sm text-gray-500">
                                {application.coverLetterFile.split("/").pop()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `${API_BASE.replace("/api", "")}${application.coverLetterFile}`,
                                "_blank"
                              )
                            }
                            className="border-gray-200 hover:border-green-500 hover:text-green-600"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Ver Carta
                          </Button>
                        </div>
                      )}

                      {!application.cvFile && !application.coverLetterFile && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">
                            No hay documentos adjuntos
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Sube tu CV y carta de presentación para destacar tu
                            perfil
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "messages" && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Mensajes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <YouthApplicationChat applicationId={applicationId} />
                </CardContent>
              </Card>
            )}

            {activeTab === "interests" && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Intereses de Empresas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CompanyInterestsList applicationId={applicationId} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  Acciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() =>
                    router.push(`/my-applications/${applicationId}/edit`)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Postulación
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("messages")}
                  className="w-full border-gray-200 hover:border-green-500 hover:text-green-600"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ver Mensajes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Postulación
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-medium">Vistas:</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">
                    {application.viewsCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-medium">
                      Intereses:
                    </span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">
                    {application.applicationsCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span className="text-gray-600 font-medium">Estado:</span>
                  </div>
                  <Badge
                    className={`${getStatusColor(application.status)} border-0 px-3 py-1`}
                  >
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-medium">
                      Visibilidad:
                    </span>
                  </div>
                  <Badge
                    variant={application.isPublic ? "default" : "secondary"}
                    className="px-3 py-1"
                  >
                    {application.isPublic ? "Pública" : "Privada"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Youth Profile */}
            {application.youthProfile && (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Mi Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="w-16 h-16 bg-blue-100">
                      <AvatarImage
                        src={application.youthProfile.avatarUrl || undefined}
                      />
                      <AvatarFallback className="text-blue-600 font-semibold text-lg">
                        {application.youthProfile.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">
                        {application.youthProfile.firstName}{" "}
                        {application.youthProfile.lastName}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {application.youthProfile.email}
                      </p>
                    </div>
                  </div>

                  {application.youthProfile.skills &&
                    application.youthProfile.skills.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Habilidades:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {application.youthProfile.skills.map(
                            (skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs px-3 py-1 border-gray-200 text-gray-700"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="space-y-4">
                    {application.youthProfile.educationLevel && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Nivel de Educación:
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.youthProfile.educationLevel}
                        </p>
                      </div>
                    )}

                    {application.youthProfile.currentDegree && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Carrera Actual:
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.youthProfile.currentDegree}
                        </p>
                      </div>
                    )}

                    {application.youthProfile.universityName && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Universidad:
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.youthProfile.universityName}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
