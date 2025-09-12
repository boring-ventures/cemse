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
  Edit,
  FileText,
  RefreshCw,
  Plus,
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

import { useToast } from "@/hooks/use-toast";
import { useMyApplications } from "@/hooks/use-youth-applications";
import { API_BASE } from "@/lib/api";
import {
  YouthApplicationService,
  YouthApplication,
} from "@/services/youth-application.service";
import YouthApplicationEditModal from "@/components/youth-applications/YouthApplicationEditModal";
import YouthApplicationDetailsModal from "@/components/youth-applications/YouthApplicationDetailsModal";
import ChatListModal from "@/components/youth-applications/ChatListModal";
import { Textarea } from "@/components/ui/textarea";
import { useYouthApplicationMessages } from "@/hooks/use-youth-application-messages";
import { useAuthContext } from "@/hooks/use-auth";

interface YouthApplicationStats {
  total: number;
  active: number;
  paused: number;
  closed: number;
  hired: number;
  public: number;
  private: number;
}

export default function MyYouthApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: applications,
    isLoading: loading,
    refetch,
  } = useMyApplications();

  const [filteredApplications, setFilteredApplications] = useState<
    YouthApplication[]
  >([]);
  const [stats, setStats] = useState<YouthApplicationStats>({
    total: 0,
    active: 0,
    paused: 0,
    closed: 0,
    hired: 0,
    public: 0,
    private: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL");
  const [selectedApplication, setSelectedApplication] =
    useState<YouthApplication | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<YouthApplication | null>(null);
  const [detailsApplication, setDetailsApplication] =
    useState<YouthApplication | null>(null);

  // Chat state
  const [newMessage, setNewMessage] = useState("");
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
  } = useYouthApplicationMessages(selectedApplication?.id || "");

  useEffect(() => {
    console.log(
      "🔍 MyYouthApplicationsPage - applications data:",
      applications
    );
    filterApplications();
    calculateStats();
  }, [applications, searchQuery, statusFilter, visibilityFilter]);

  const filterApplications = () => {
    const applicationsArray = Array.isArray(applications) ? applications : [];
    let filtered = [...applicationsArray];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.title?.toLowerCase().includes(query) ||
          app.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Visibility filter
    if (visibilityFilter !== "ALL") {
      const isPublic = visibilityFilter === "PUBLIC";
      filtered = filtered.filter((app) => app.isPublic === isPublic);
    }

    setFilteredApplications(filtered);
  };

  const calculateStats = () => {
    const applicationsArray = Array.isArray(applications) ? applications : [];
    setStats({
      total: applicationsArray.length,
      active: applicationsArray.filter((app) => app.status === "ACTIVE").length,
      paused: applicationsArray.filter((app) => app.status === "PAUSED").length,
      closed: applicationsArray.filter((app) => app.status === "CLOSED").length,
      hired: applicationsArray.filter((app) => app.status === "HIRED").length,
      public: applicationsArray.filter((app) => app.isPublic).length,
      private: applicationsArray.filter((app) => !app.isPublic).length,
    });
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await YouthApplicationService.deleteYouthApplication(applicationId);
      toast({
        title: "Postulación eliminada",
        description: "Tu postulación ha sido eliminada exitosamente",
      });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la postulación",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "PAUSED":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "CLOSED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "HIRED":
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
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
      month: "short",
      day: "numeric",
    });
  };

  const handleOpenChat = (application: YouthApplication) => {
    setSelectedApplication(application);
    setShowChatModal(true);
  };

  const handleOpenEdit = (application: YouthApplication) => {
    setEditingApplication(application);
    setShowEditModal(true);
  };

  const handleOpenDetails = (application: YouthApplication) => {
    setDetailsApplication(application);
    setShowDetailsModal(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedApplication) return;

    try {
      await sendJobMessage({
        content: newMessage.trim(),
        messageType: "TEXT",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-6 w-96" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <Card key={i} className="bg-white shadow-sm border-0">
                  <CardContent className="p-6 text-center">
                    <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters Skeleton */}
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="flex flex-col lg:flex-row gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-48" />
                  <Skeleton className="h-12 w-48" />
                </div>
              </CardContent>
            </Card>

            {/* Applications Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-14 h-14 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          <div className="flex gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Postulaciones de Joven
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona las postulaciones que has creado para que las empresas
                te encuentren
              </p>
            </div>
            <Button
              onClick={() => router.push("/youth-applications/new")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Crear Nueva Postulación
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total}
              </div>
              <div className="text-sm font-medium text-gray-600">Total</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.active}
              </div>
              <div className="text-sm font-medium text-gray-600">Activas</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {stats.paused}
              </div>
              <div className="text-sm font-medium text-gray-600">Pausadas</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {stats.closed}
              </div>
              <div className="text-sm font-medium text-gray-600">Cerradas</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.hired}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Contratado
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.public}
              </div>
              <div className="text-sm font-medium text-gray-600">Públicas</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {stats.private}
              </div>
              <div className="text-sm font-medium text-gray-600">Privadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filtros y Búsqueda
              </h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar por título o descripción..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-48 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      <SelectItem value="ACTIVE">Activas</SelectItem>
                      <SelectItem value="PAUSED">Pausadas</SelectItem>
                      <SelectItem value="CLOSED">Cerradas</SelectItem>
                      <SelectItem value="HIRED">Contratado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={visibilityFilter}
                    onValueChange={(value) => setVisibilityFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-48 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Filtrar por visibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas</SelectItem>
                      <SelectItem value="PUBLIC">Públicas</SelectItem>
                      <SelectItem value="PRIVATE">Privadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Mis Postulaciones ({filteredApplications.length})
              </h2>
            </div>

            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-0 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="w-14 h-14 bg-blue-100">
                            <AvatarFallback className="text-blue-600 font-semibold text-lg">
                              {application.title?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {application.title || "Sin título"}
                                </h3>
                                <p className="text-gray-600 line-clamp-2 text-base leading-relaxed">
                                  {application.description || "Sin descripción"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge
                                  className={`${getStatusColor(application.status)} border-0 px-3 py-1`}
                                >
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(application.status)}
                                    <span className="font-medium">
                                      {getStatusLabel(application.status)}
                                    </span>
                                  </div>
                                </Badge>
                                <Badge
                                  variant={
                                    application.isPublic
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="px-3 py-1"
                                >
                                  {application.isPublic ? "Pública" : "Privada"}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Creada:</span>
                                <span>{formatDate(application.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Intereses:</span>
                                <span>
                                  {application.applicationsCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="border-t pt-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Primary Actions */}
                          <div className="flex flex-wrap items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetails(application)}
                              className="flex items-center gap-2 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalle
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenChat(application)}
                              className="flex items-center gap-2 border-gray-200 hover:border-green-500 hover:text-green-600"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Conversaciones
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
                                className="flex items-center gap-2 border-gray-200 hover:border-purple-500 hover:text-purple-600"
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
                                className="flex items-center gap-2 border-gray-200 hover:border-purple-500 hover:text-purple-600"
                              >
                                <Download className="w-4 h-4" />
                                Ver Carta
                              </Button>
                            )}
                          </div>

                          {/* Secondary Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(application)}
                              className="flex items-center gap-2 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteApplication(application.id)
                              }
                              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {Array.isArray(applications) && applications.length === 0
                ? "No has creado ninguna postulación"
                : "No se encontraron postulaciones"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              {Array.isArray(applications) && applications.length === 0
                ? "Crea tu primera postulación para que las empresas puedan encontrarte y conecten contigo."
                : "Intenta ajustar tus filtros de búsqueda para encontrar lo que buscas."}
            </p>
            {Array.isArray(applications) && applications.length === 0 && (
              <Button
                onClick={() => router.push("/youth-applications/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Mi Primera Postulación
              </Button>
            )}
          </div>
        )}

        {/* Chat Modal */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 bg-white">
            <DialogHeader className="p-6 pb-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Chat de Postulación
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                      {selectedApplication?.title || "Sin título"}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowChatModal(false);
                      setTimeout(() => setShowChatModal(true), 100);
                    }}
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recargar
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 font-medium">
                      Cargando mensajes...
                    </p>
                  </div>
                </div>
              ) : messageError ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error al cargar mensajes
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    {messageError}
                  </p>
                  <Button
                    variant="outline"
                    onClick={refreshMessages}
                    disabled={messagesLoading}
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay mensajes
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Inicia la conversación enviando un mensaje a la empresa.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {(messages || []).map((message) => {
                    const isOwnMessage =
                      message.senderType === "YOUTH" &&
                      message.senderId === user?.id;
                    const isCompanyMessage = message.senderType === "COMPANY";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] ${isOwnMessage ? "order-2" : "order-1"}`}
                        >
                          {/* Sender info */}
                          <div
                            className={`text-xs mb-2 font-medium ${
                              isOwnMessage
                                ? "text-right text-blue-600"
                                : "text-left text-gray-600"
                            }`}
                          >
                            {isOwnMessage
                              ? "Tú"
                              : isCompanyMessage
                                ? "Empresa"
                                : "Usuario"}
                          </div>

                          {/* Message bubble */}
                          <div
                            className={`p-4 rounded-2xl shadow-sm ${
                              isOwnMessage
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <p
                                className={`text-xs ${
                                  isOwnMessage
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </p>
                              {isOwnMessage && (
                                <div className="text-xs text-blue-100">
                                  {message.status === "READ" ? "✓✓" : "✓"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-white">
              {messageError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    {messageError}
                  </p>
                </div>
              )}
              <div className="flex items-end space-x-3">
                <div className="flex-1">
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
                    className="min-h-[60px] max-h-[150px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={messageSending}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={messageSending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 min-w-[100px]"
                >
                  {messageSending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    "Enviar"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <YouthApplicationEditModal
          application={editingApplication}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={refetch}
        />

        {/* Details Modal */}
        <YouthApplicationDetailsModal
          application={detailsApplication}
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
        />

        {/* Chat List Modal */}
        <ChatListModal
          applicationId={selectedApplication?.id || ""}
          applicationTitle={selectedApplication?.title || ""}
          open={showChatModal}
          onOpenChange={setShowChatModal}
        />
      </div>
    </div>
  );
}
