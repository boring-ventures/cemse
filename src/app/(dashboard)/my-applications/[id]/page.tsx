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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div>
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Postulación no encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              La postulación que buscas no existe o no tienes permisos para
              verla.
            </p>
            <Button onClick={() => router.push("/my-youth-applications")}>
              Volver a Mis Postulaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {application.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span>Creada el {formatDate(application.createdAt)}</span>
              <span>•</span>
              <span>{application.viewsCount || 0} vistas</span>
              <span>•</span>
              <span>{application.applicationsCount || 0} intereses</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(application.status)} border-0`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(application.status)}
                <span>{getStatusLabel(application.status)}</span>
              </div>
            </Badge>
            <Badge variant={application.isPublic ? "default" : "secondary"}>
              {application.isPublic ? "Pública" : "Privada"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "messages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Mensajes
            </button>
            <button
              onClick={() => setActiveTab("interests")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "interests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Intereses de Empresas
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.description}
                  </p>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.cvFile && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">CV</p>
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
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ver CV
                        </Button>
                      </div>
                    )}

                    {application.coverLetterFile && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Carta de Presentación</p>
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
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ver Carta
                        </Button>
                      </div>
                    )}

                    {!application.cvFile && !application.coverLetterFile && (
                      <p className="text-gray-500 text-center py-4">
                        No hay documentos adjuntos
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "messages" && (
            <Card>
              <CardHeader>
                <CardTitle>Mensajes</CardTitle>
              </CardHeader>
              <CardContent>
                <YouthApplicationChat applicationId={applicationId} />
              </CardContent>
            </Card>
          )}

          {activeTab === "interests" && (
            <Card>
              <CardHeader>
                <CardTitle>Intereses de Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                <CompanyInterestsList applicationId={applicationId} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() =>
                  router.push(`/my-applications/${applicationId}/edit`)
                }
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Postulación
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("messages")}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ver Mensajes
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Postulación
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Vistas:</span>
                <span className="font-medium">
                  {application.viewsCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Intereses:</span>
                <span className="font-medium">
                  {application.applicationsCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <Badge className={getStatusColor(application.status)}>
                  {getStatusLabel(application.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visibilidad:</span>
                <Badge variant={application.isPublic ? "default" : "secondary"}>
                  {application.isPublic ? "Pública" : "Privada"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Youth Profile */}
          {application.youthProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={application.youthProfile.avatarUrl || undefined}
                    />
                    <AvatarFallback>
                      {application.youthProfile.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {application.youthProfile.firstName}{" "}
                      {application.youthProfile.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {application.youthProfile.email}
                    </p>
                  </div>
                </div>

                {application.youthProfile.skills &&
                  application.youthProfile.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Habilidades:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {application.youthProfile.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {application.youthProfile.educationLevel && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Nivel de Educación:
                    </p>
                    <p className="text-sm text-gray-600">
                      {application.youthProfile.educationLevel}
                    </p>
                  </div>
                )}

                {application.youthProfile.currentDegree && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Carrera Actual:
                    </p>
                    <p className="text-sm text-gray-600">
                      {application.youthProfile.currentDegree}
                    </p>
                  </div>
                )}

                {application.youthProfile.universityName && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Universidad:
                    </p>
                    <p className="text-sm text-gray-600">
                      {application.youthProfile.universityName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
