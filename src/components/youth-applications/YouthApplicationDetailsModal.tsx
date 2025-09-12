"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  MessageSquare,
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { YouthApplication } from "@/services/youth-application.service";
import { API_BASE } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ChatListModal from "./ChatListModal";

interface CompanyInterest {
  id: string;
  applicationId: string;
  companyId: string;
  status:
    | "INTERESTED"
    | "CONTACTED"
    | "INTERVIEW_SCHEDULED"
    | "HIRED"
    | "NOT_INTERESTED";
  message?: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    businessSector?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
  };
}

interface YouthApplicationDetailsModalProps {
  application: YouthApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function YouthApplicationDetailsModal({
  application,
  open,
  onOpenChange,
}: YouthApplicationDetailsModalProps) {
  const { toast } = useToast();
  const [companyInterests, setCompanyInterests] = useState<CompanyInterest[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(false);

  useEffect(() => {
    if (open && application) {
      fetchCompanyInterests();
    }
  }, [open, application]);

  const fetchCompanyInterests = async () => {
    if (!application) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/youthapplication/${application.id}/company-interest`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCompanyInterests(data || []);
      }
    } catch (error) {
      console.error("Error fetching company interests:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los intereses de las empresas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "CONTACTED":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "INTERVIEW_SCHEDULED":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "HIRED":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "NOT_INTERESTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return "Interesada";
      case "CONTACTED":
        return "Contactada";
      case "INTERVIEW_SCHEDULED":
        return "Entrevista Programada";
      case "HIRED":
        return "Contratada";
      case "NOT_INTERESTED":
        return "No Interesada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CONTACTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "INTERVIEW_SCHEDULED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "HIRED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "NOT_INTERESTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Ahora";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const interestedCompanies = companyInterests.filter(
    (interest) =>
      interest.status === "INTERESTED" ||
      interest.status === "CONTACTED" ||
      interest.status === "INTERVIEW_SCHEDULED" ||
      interest.status === "HIRED"
  );

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0 bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Detalles de Postulación
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {application.title}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={application.isPublic ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {application.isPublic ? "Pública" : "Privada"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Application Overview */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {application.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {application.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">
                        {application.viewsCount}
                      </span>{" "}
                      visualizaciones
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">
                        {application.applicationsCount}
                      </span>{" "}
                      intereses
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Creada {formatDate(application.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Files */}
                {(application.cvFile || application.coverLetterFile) && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Archivos Adjuntos
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {application.cvFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `${API_BASE.replace("/api", "")}${application.cvFile}`,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Ver CV
                        </Button>
                      )}
                      {application.coverLetterFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `${API_BASE.replace("/api", "")}${application.coverLetterFile}`,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Ver Carta de Presentación
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Interests */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Empresas Interesadas ({interestedCompanies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-24" />
                      </div>
                    ))}
                  </div>
                ) : interestedCompanies.length > 0 ? (
                  <div className="space-y-4">
                    {interestedCompanies.map((interest) => (
                      <div
                        key={interest.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={interest.company.logoUrl} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {interest.company.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {interest.company.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {interest.company.businessSector ||
                                "Sector no especificado"}
                            </p>
                            {interest.message && (
                              <p className="text-sm text-gray-500 mt-1 italic">
                                "{interest.message}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${getStatusColor(interest.status)} border`}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(interest.status)}
                              <span className="font-medium">
                                {getStatusLabel(interest.status)}
                              </span>
                            </div>
                          </Badge>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {formatDate(interest.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay empresas interesadas
                    </h3>
                    <p className="text-sm text-gray-600">
                      Aún no hay empresas que hayan mostrado interés en tu
                      postulación.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat with Companies */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Conversaciones con Empresas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ver Conversaciones
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Accede a todas tus conversaciones con empresas sobre esta
                    postulación.
                  </p>
                  <Button
                    onClick={() => setShowChatList(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Abrir Conversaciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>

      {/* Chat List Modal */}
      <ChatListModal
        applicationId={application.id}
        applicationTitle={application.title}
        open={showChatList}
        onOpenChange={setShowChatList}
      />
    </Dialog>
  );
}
