"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { JobApplication, ApplicationStatus } from "@/types/jobs";
import { useToast } from "@/components/ui/use-toast";
import { useMyJobApplications } from "@/hooks/useJobApplicationApi";
import { useJobMessages } from "@/hooks/use-job-messages";
import { useAuthContext } from "@/hooks/use-auth";
import { API_BASE, getAuthHeaders } from "@/lib/api";

interface ApplicationStats {
  total: number;
  sent: number;
  underReview: number;
  preSelected: number;
  rejected: number;
  hired: number;
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const {
    data: applications,
    loading,
    error,
    refresh,
  } = useMyJobApplications();
  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    sent: 0,
    underReview: 0,
    preSelected: 0,
    rejected: 0,
    hired: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL"
  );
  const [companyFilter, setCompanyFilter] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const { toast } = useToast();
  const { user } = useAuthContext();

  // Chat hook for the selected application
  const {
    messages,
    loading: messagesLoading,
    sending: messageSending,
    error: messageError,
    sendMessage: sendJobMessage,
    markAsRead,
    refreshMessages,
  } = useJobMessages(selectedApplication?.id || "");

  // Update chat when application changes - REMOVED to prevent multiple requests
  // useEffect(() => {
  //   if (selectedApplication) {
  //     refreshMessages();
  //   }
  // }, [selectedApplication, refreshMessages]);

  useEffect(() => {
    console.log("🔍 MyApplicationsPage - applications data:", applications);
    console.log(
      "🔍 MyApplicationsPage - applications is array:",
      Array.isArray(applications)
    );
    filterApplications();
  }, [applications, searchQuery, statusFilter, companyFilter]);

  const filterApplications = () => {
    // Ensure applications is an array
    const applicationsArray = Array.isArray(applications) ? applications : [];
    let filtered = [...applicationsArray];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.jobOffer?.title?.toLowerCase().includes(query) ||
          app.jobOffer?.company?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Company filter
    if (companyFilter) {
      filtered = filtered.filter((app) =>
        app.jobOffer?.company?.name
          ?.toLowerCase()
          .includes(companyFilter.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/jobapplication/${applicationId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: "Aplicación retirada",
          description: "Tu aplicación ha sido retirada exitosamente",
        });
        // Refresh the applications data
        refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "No se pudo retirar la aplicación",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo retirar la aplicación",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "SENT":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "UNDER_REVIEW":
        return <Eye className="w-4 h-4 text-orange-600" />;
      case "PRE_SELECTED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "HIRED":
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case "SENT":
        return "Enviada";
      case "UNDER_REVIEW":
        return "En revisión";
      case "PRE_SELECTED":
        return "Preseleccionado";
      case "REJECTED":
        return "Rechazada";
      case "HIRED":
        return "Contratado";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW":
        return "bg-orange-100 text-orange-800";
      case "PRE_SELECTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
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
      month: "short",
      day: "numeric",
    });
  };

  const canWithdraw = (status: ApplicationStatus) => {
    return status === "SENT";
  };

  const handleOpenChat = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowChatModal(true);
    // Load messages only when opening the chat
    refreshMessages();
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setSelectedApplication(null);
    setNewMessage("");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedApplication) return;

    try {
      await sendJobMessage({
        content: newMessage.trim(),
        messageType: "TEXT",
      });
      setNewMessage("");
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (message: any) => {
    // Check if the message sender is the current user
    // For applicants: senderType should be "APPLICANT" and senderId should match user.id
    return message.senderType === "APPLICANT" && message.senderId === user?.id;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mis Aplicaciones
        </h1>
        <p className="text-gray-600">
          Gestiona y da seguimiento a tus postulaciones laborales
        </p>
      </div>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Mis Aplicaciones
          </h1>
          <p className="text-gray-600">
            Gestiona y da seguimiento a tus postulaciones laborales
          </p>
        </div>
        <Button onClick={() => router.push("/my-applications/new")}>
          + Nueva Postulación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Array.isArray(applications) ? applications.length : 0}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(applications)
                ? applications.filter((app) => app.status === "SENT").length
                : 0}
            </div>
            <div className="text-sm text-gray-600">Enviadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Array.isArray(applications)
                ? applications.filter((app) => app.status === "UNDER_REVIEW")
                    .length
                : 0}
            </div>
            <div className="text-sm text-gray-600">En revisión</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(applications)
                ? applications.filter((app) => app.status === "PRE_SELECTED")
                    .length
                : 0}
            </div>
            <div className="text-sm text-gray-600">Preseleccionado</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {Array.isArray(applications)
                ? applications.filter((app) => app.status === "REJECTED").length
                : 0}
            </div>
            <div className="text-sm text-gray-600">Rechazadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por trabajo o empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ApplicationStatus | "ALL")
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="SENT">Enviadas</SelectItem>
                <SelectItem value="UNDER_REVIEW">En revisión</SelectItem>
                <SelectItem value="PRE_SELECTED">Preseleccionado</SelectItem>
                <SelectItem value="REJECTED">Rechazadas</SelectItem>
                <SelectItem value="HIRED">Contratado</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filtrar por empresa..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {application.jobOffer?.company?.name?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() =>
                              router.push(`/jobs/${application.jobOffer?.id}`)
                            }
                          >
                            {application.jobOffer?.title || "Sin título"}
                          </h3>
                          <p className="text-gray-600">
                            {application.jobOffer?.company?.name ||
                              "Sin empresa"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${getStatusColor(application.status)} border-0`}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span>{getStatusLabel(application.status)}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Aplicado:</span>{" "}
                          {formatDate(application.appliedAt)}
                        </div>
                        <div>
                          <span className="font-medium">
                            Última actualización:
                          </span>{" "}
                          {formatDate(application.appliedAt)}
                        </div>
                        {application.rating && (
                          <div>
                            <span className="font-medium">Valoración:</span>{" "}
                            {application.rating}/5 ⭐
                          </div>
                        )}
                      </div>

                      {/* Información adicional del trabajo */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">
                              Empresa:
                            </span>{" "}
                            <span className="text-gray-700">
                              {application.jobOffer?.company?.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">
                              Email de la empresa:
                            </span>{" "}
                            <span className="text-gray-700">
                              {application.jobOffer?.company?.email}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">
                              Título del trabajo:
                            </span>{" "}
                            <span className="text-gray-700">
                              {application.jobOffer?.title}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">
                              ID del trabajo:
                            </span>{" "}
                            <span className="text-gray-700">
                              {application.jobOffer?.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      {application.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Notas del empleador:
                            </span>{" "}
                            {application.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChat(application)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat
                          </Button>

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
                            >
                              <Download className="w-4 h-4 mr-2" />
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
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Ver Carta
                            </Button>
                          )}
                        </div>

                        {canWithdraw(application.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleWithdrawApplication(application.id)
                            }
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Retirar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {Array.isArray(applications) && applications.length === 0
                ? "No has aplicado a ningún empleo"
                : "No se encontraron aplicaciones"}
            </h3>
            <p className="text-gray-600 mb-6">
              {Array.isArray(applications) && applications.length === 0
                ? "Comienza explorando oportunidades laborales que se ajusten a tu perfil."
                : "Intenta ajustar tus filtros de búsqueda."}
            </p>
            <Button onClick={() => router.push("/jobs")}>
              {Array.isArray(applications) && applications.length === 0
                ? "Explorar empleos"
                : "Ver todos los empleos"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Chat con{" "}
                  {selectedApplication?.jobOffer?.company?.name || "Empresa"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {selectedApplication?.jobOffer?.title || "Sin título"}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMessages}
                disabled={messagesLoading}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {messagesLoading ? "Cargando..." : "Recargar"}
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <Skeleton className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Cargando mensajes...</p>
                </div>
              </div>
            ) : messageError ? (
              <div className="text-center py-12 text-red-600">
                <MessageSquare className="w-12 h-12 text-red-400 mb-4 mx-auto" />
                <p className="mb-2">Error al cargar mensajes</p>
                <p className="text-sm text-gray-600 mb-4">{messageError}</p>
                <Button 
                  variant="outline" 
                  onClick={refreshMessages}
                  disabled={messagesLoading}
                >
                  Reintentar
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                <p>No hay mensajes en esta conversación.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Inicia la conversación enviando un mensaje.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage(message) ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isOwnMessage(message)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs mt-1 ${
                          isOwnMessage(message) ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </p>
                        {isOwnMessage(message) && (
                          <div className="text-xs text-blue-100">
                            {message.status === 'READ' ? '✓✓' : '✓'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 pt-0 border-t">
            {messageError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{messageError}</p>
              </div>
            )}
            <Textarea
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[50px] max-h-[150px] resize-none"
              disabled={messageSending}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </p>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={messageSending || !newMessage.trim()}
                className="min-w-[80px]"
              >
                {messageSending ? (
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    Enviando...
                  </div>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
