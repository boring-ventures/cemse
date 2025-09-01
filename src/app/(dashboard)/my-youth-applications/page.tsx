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
import YouthApplicationChat from "@/components/youth-applications/YouthApplicationChat";
import UnreadMessagesBadge from "@/components/youth-applications/UnreadMessagesBadge";
import YouthApplicationEditModal from "@/components/youth-applications/YouthApplicationEditModal";

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
  const [editingApplication, setEditingApplication] = useState<YouthApplication | null>(null);

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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Mis Postulaciones de Joven
          </h1>
          <p className="text-gray-600">
            Gestiona las postulaciones que has creado para que las empresas te
            encuentren
          </p>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-sm text-gray-600">Activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.paused}
            </div>
            <div className="text-sm text-gray-600">Pausadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.closed}
            </div>
            <div className="text-sm text-gray-600">Cerradas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.hired}
            </div>
            <div className="text-sm text-gray-600">Contratado</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.public}
            </div>
            <div className="text-sm text-gray-600">Públicas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.private}
            </div>
            <div className="text-sm text-gray-600">Privadas</div>
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
                  placeholder="Buscar por título o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por visibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="PUBLIC">Públicas</SelectItem>
                <SelectItem value="PRIVATE">Privadas</SelectItem>
              </SelectContent>
            </Select>
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
                        {application.title?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.title || "Sin título"}
                          </h3>
                          <p className="text-gray-600 line-clamp-2">
                            {application.description || "Sin descripción"}
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
                          <Badge
                            variant={
                              application.isPublic ? "default" : "secondary"
                            }
                          >
                            {application.isPublic ? "Pública" : "Privada"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Creada:</span>{" "}
                          {formatDate(application.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Vistas:</span>{" "}
                          {application.viewsCount || 0}
                        </div>
                        <div>
                          <span className="font-medium">Intereses:</span>{" "}
                          {application.applicationsCount || 0}
                        </div>
                        <div>
                          <span className="font-medium">ID:</span>{" "}
                          {application.id}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/my-applications/${application.id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChat(application)}
                            className="relative"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat
                            <UnreadMessagesBadge
                              applicationId={application.id}
                            />
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

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(application)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteApplication(application.id)
                            }
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
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
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {Array.isArray(applications) && applications.length === 0
                ? "No has creado ninguna postulación"
                : "No se encontraron postulaciones"}
            </h3>
            <p className="text-gray-600 mb-6">
              {Array.isArray(applications) && applications.length === 0
                ? "Crea tu primera postulación para que las empresas puedan encontrarte."
                : "Intenta ajustar tus filtros de búsqueda."}
            </p>

          </CardContent>
        </Card>
      )}

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Chat de Postulación
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {selectedApplication?.title || "Sin título"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6">
            {selectedApplication && (
              <YouthApplicationChat
                applicationId={selectedApplication.id}
                youthProfile={{
                  firstName:
                    selectedApplication.youthProfile?.firstName || "Joven",
                  lastName:
                    selectedApplication.youthProfile?.lastName ||
                    "Desarrollador",
                  avatarUrl: selectedApplication.youthProfile?.avatarUrl,
                }}
              />
            )}
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
    </div>
  );
}
