"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Star,
  Eye,
  Edit3,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  MoreHorizontal,
  Send,
  RefreshCw,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { JobApplication, ApplicationStatus } from "@/types/jobs";
import { Checkbox } from "@/components/ui/checkbox";
import { useRef } from "react";
import { useJobOffers } from "@/hooks/useJobOfferApi";
import { useProfiles } from "@/hooks/useProfileApi";
import { useYouthApplicationMessages } from "@/hooks/use-youth-application-messages";
import {
  useExpressCompanyInterest,
  useCompanyInterests,
  useUpdateCompanyInterestStatus,
} from "@/hooks/use-youth-applications";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Heart, HeartHandshake } from "lucide-react";

interface CandidatesData {
  candidates: JobApplication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    byStatus: {
      sent: number;
      underReview: number;
      preSelected: number;
      rejected: number;
      hired: number;
    };
    byJob: Record<string, { jobTitle: string; count: number }>;
    averageRating: number;
  };
}

export default function CandidatesPage() {
  const [candidatesData, setCandidatesData] = useState<CandidatesData | null>(
    null
  );
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCandidate, setSelectedCandidate] =
    useState<JobApplication | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [candidateRating, setCandidateRating] = useState<number>(0);
  const [candidateStatus, setCandidateStatus] =
    useState<ApplicationStatus>("SENT");
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [candidateToReject, setCandidateToReject] =
    useState<JobApplication | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [selectedCandidateForInterest, setSelectedCandidateForInterest] =
    useState<JobApplication | null>(null);

  // Chat hook for the selected candidate
  const {
    messages,
    loading: messagesLoading,
    sending: messageSending,
    error: messageError,
    sendMessage: sendJobMessage,
    markAsRead,
    refreshMessages,
  } = useYouthApplicationMessages(selectedCandidate?.id || "");

  // Company interest hooks
  const currentUser = useCurrentUser();
  const expressInterest = useExpressCompanyInterest();
  const updateInterestStatus = useUpdateCompanyInterestStatus();

  // Get company interests for the selected candidate
  const { data: companyInterests } = useCompanyInterests(
    selectedCandidate?.id || ""
  );

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, statusFilter, sortBy, sortOrder, page]);

  // Load messages when chat modal opens
  useEffect(() => {
    if (showChatModal && selectedCandidate) {
      refreshMessages();
    }
  }, [showChatModal, selectedCandidate]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),

        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/youthapplication?${queryParams}`);
      if (!response.ok) {
        throw new Error("Error al cargar postulaciones de jóvenes");
      }

      const data = await response.json();

      // Transform the data to match our expected structure
      const transformedData: CandidatesData = {
        candidates: data.map((app: any) => ({
          id: app.id,
          status:
            app.status === "ACTIVE"
              ? "SENT"
              : app.status === "PAUSED"
                ? "UNDER_REVIEW"
                : app.status === "CLOSED"
                  ? "REJECTED"
                  : app.status === "HIRED"
                    ? "HIRED"
                    : "SENT",
          appliedAt: app.createdAt,
          coverLetter: app.description,
          cvFile: app.cvFile || app.cvUrl,
          rating: 0,
          notes: "",
          applicant: {
            id: app.youthProfile?.userId || app.id,
            firstName: app.youthProfile?.firstName || "Sin nombre",
            lastName: app.youthProfile?.lastName || "",
            email: app.youthProfile?.email || "Sin email",
            avatarUrl: undefined,
            location: undefined,
            phone: undefined,
          },
          jobOffer: {
            id: app.id,
            title: app.title,
            company: undefined,
          },
          cvData: undefined,
          questionAnswers: undefined,
        })),
        pagination: {
          total: data.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(data.length / 10),
        },
        stats: {
          total: data.length,
          byStatus: {
            sent: data.filter((app: any) => app.status === "ACTIVE").length,
            underReview: data.filter((app: any) => app.status === "PAUSED")
              .length,
            preSelected: 0,
            rejected: data.filter((app: any) => app.status === "CLOSED").length,
            hired: data.filter((app: any) => app.status === "HIRED").length,
          },
          byJob: {},
          averageRating: 0,
        },
      };

      setCandidatesData(transformedData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las postulaciones de jóvenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = async (
    candidateId: string,
    updates: Partial<JobApplication>
  ) => {
    try {
      const response = await fetch("/api/jobs/candidates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar candidato");
      }

      toast({
        title: "Candidato actualizado",
        description: "Los cambios se han guardado exitosamente",
      });

      fetchCandidates();
      setUpdateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el candidato",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (
    candidate: JobApplication,
    newStatus: ApplicationStatus
  ) => {
    updateCandidate(candidate.id, { status: newStatus });
  };

  const openUpdateDialog = (candidate: JobApplication) => {
    setSelectedCandidate(candidate);
    setCandidateNotes(candidate.notes || "");
    setCandidateRating(candidate.rating || 0);
    setCandidateStatus(candidate.status);
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!selectedCandidate) return;

    updateCandidate(selectedCandidate.id, {
      notes: candidateNotes,
      rating: candidateRating || undefined,
      status: candidateStatus,
    });
  };

  const handleRejectClick = (candidate: JobApplication) => {
    setCandidateToReject(candidate);
    setRejectionMessage("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!candidateToReject) return;
    // Here you would send the rejection message to the backend if needed
    // For now, just log it
    console.log(
      "Rejected candidate:",
      candidateToReject.id,
      "Message:",
      rejectionMessage
    );
    handleStatusChange(candidateToReject, "REJECTED");
    setRejectDialogOpen(false);
    setCandidateToReject(null);
    setRejectionMessage("");
  };

  // Chat handlers
  const handleOpenChat = (candidate: JobApplication) => {
    setSelectedCandidate(candidate);
    setShowChatModal(true);
    // Load messages when opening chat
    refreshMessages();
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setSelectedCandidate(null);
    setNewMessage("");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCandidate) return;

    try {
      await sendJobMessage({
        content: newMessage.trim(),
        messageType: "TEXT",
      });
      setNewMessage("");

      // Show success toast
      toast({
        title: "Mensaje enviado",
        description: "El mensaje se ha enviado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    }
  };

  // Interest marking handlers
  const handleExpressInterest = (candidate: JobApplication) => {
    setSelectedCandidateForInterest(candidate);
    setInterestMessage("");
    setShowInterestModal(true);
  };

  const handleConfirmInterest = async () => {
    if (!selectedCandidateForInterest || !currentUser?.profile?.company?.id)
      return;

    try {
      await expressInterest.mutateAsync({
        applicationId: selectedCandidateForInterest.id,
        data: {
          companyId: currentUser.profile.company.id,
          status: "INTERESTED",
          message: interestMessage.trim() || undefined,
        },
      });

      toast({
        title: "Interés expresado",
        description: "Has expresado interés en este candidato",
      });

      setShowInterestModal(false);
      setSelectedCandidateForInterest(null);
      setInterestMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo expresar el interés. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInterestStatus = async (
    candidateId: string,
    newStatus: string
  ) => {
    if (!currentUser?.profile?.company?.id) return;

    try {
      await updateInterestStatus.mutateAsync({
        applicationId: candidateId,
        data: {
          companyId: currentUser.profile.company.id,
          status: newStatus as any,
        },
      });

      toast({
        title: "Estado actualizado",
        description: "El estado del interés ha sido actualizado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  // Check if company has expressed interest in a candidate
  const hasCompanyInterest = (candidateId: string) => {
    if (!companyInterests || !currentUser?.profile?.company?.id) return false;
    return companyInterests.some(
      (interest) =>
        interest.companyId === currentUser.profile!.company!.id &&
        interest.applicationId === candidateId
    );
  };

  // Get company's interest status for a candidate
  const getCompanyInterestStatus = (candidateId: string) => {
    if (!companyInterests || !currentUser?.profile?.company?.id) return null;
    const interest = companyInterests.find(
      (interest) =>
        interest.companyId === currentUser.profile!.company!.id &&
        interest.applicationId === candidateId
    );
    return interest?.status || null;
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

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      SENT: { label: "Enviado", variant: "secondary" as const, icon: Clock },
      UNDER_REVIEW: {
        label: "En Revisión",
        variant: "default" as const,
        icon: Eye,
      },
      PRE_SELECTED: {
        label: "Preseleccionado",
        variant: "default" as const,
        icon: CheckCircle,
      },
      REJECTED: {
        label: "Rechazado",
        variant: "destructive" as const,
        icon: XCircle,
      },
      HIRED: {
        label: "Contratado",
        variant: "default" as const,
        icon: UserCheck,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getInterestStatusBadge = (status: string) => {
    const statusConfig = {
      INTERESTED: {
        label: "Interesado",
        variant: "default" as const,
        icon: Heart,
        color: "bg-blue-100 text-blue-800",
      },
      CONTACTED: {
        label: "Contactado",
        variant: "default" as const,
        icon: Mail,
        color: "bg-yellow-100 text-yellow-800",
      },
      INTERVIEW_SCHEDULED: {
        label: "Entrevista",
        variant: "default" as const,
        icon: Calendar,
        color: "bg-purple-100 text-purple-800",
      },
      HIRED: {
        label: "Contratado",
        variant: "default" as const,
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
      },
      NOT_INTERESTED: {
        label: "No Interesado",
        variant: "destructive" as const,
        icon: XCircle,
        color: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-48" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-white shadow-sm border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters Skeleton */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </CardContent>
            </Card>

            {/* Table Skeleton */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!candidatesData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-red-100 rounded-full p-6 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Error al cargar los datos
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              No se pudieron cargar las postulaciones de jóvenes. Por favor,
              intenta de nuevo.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Postulaciones de Jóvenes
              </h1>
              <p className="text-gray-600 text-lg">
                Revisa y gestiona las postulaciones de jóvenes emprendedores
              </p>
            </div>
            <Button
              disabled={selectedCVs.length === 0}
              onClick={() => {
                selectedCVs.forEach((url) => {
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "";
                  link.target = "_blank";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar CVs Seleccionados
              {selectedCVs.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedCVs.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Total Candidatos
                </CardTitle>
                <div className="bg-blue-100 rounded-full p-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {candidatesData.stats.total}
                </div>
                <p className="text-sm text-gray-600">
                  {candidatesData.stats.averageRating.toFixed(1)} ⭐ promedio
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-gray-900">
                  En Revisión
                </CardTitle>
                <div className="bg-blue-100 rounded-full p-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {candidatesData.stats.byStatus.underReview}
                </div>
                <p className="text-sm text-gray-600">Requieren atención</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Preseleccionados
                </CardTitle>
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {candidatesData.stats.byStatus.preSelected}
                </div>
                <p className="text-sm text-gray-600">Listos para entrevista</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Contratados
                </CardTitle>
                <div className="bg-purple-100 rounded-full p-2">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {candidatesData.stats.byStatus.hired}
                </div>
                <p className="text-sm text-gray-600">Proceso exitoso</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Nuevos
                </CardTitle>
                <div className="bg-orange-100 rounded-full p-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {candidatesData.stats.byStatus.sent}
                </div>
                <p className="text-sm text-gray-600">Pendientes de revisar</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por título, descripción o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="SENT">Enviado</SelectItem>
                    <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                    <SelectItem value="PRE_SELECTED">
                      Preseleccionado
                    </SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
                    <SelectItem value="HIRED">Contratado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Fecha de creación</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Table */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Lista de Postulaciones
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {candidatesData.candidates.length} de{" "}
                    {candidatesData.pagination.total} postulaciones
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {candidatesData.candidates.length} resultados
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="w-12">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              selectedCVs.length ===
                              candidatesData.candidates.length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCVs(
                                  candidatesData.candidates
                                    .filter((c) => c.cvFile)
                                    .map((c) => c.cvFile!)
                                );
                              } else {
                                setSelectedCVs([]);
                              }
                            }}
                          />
                        </div>
                      </TableHead>

                      <TableHead className="font-semibold text-gray-900">
                        Joven
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Postulación
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Estado
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Interés
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Vistas
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Fecha Creación
                      </TableHead>
                      <TableHead className="text-right font-semibold text-gray-900">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesData.candidates.map((candidate) => (
                      <TableRow
                        key={candidate.id}
                        className="hover:bg-gray-50 border-gray-200"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedCVs.includes(
                              candidate.cvFile || ""
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCVs([
                                  ...selectedCVs,
                                  candidate.cvFile!,
                                ]);
                              } else {
                                setSelectedCVs(
                                  selectedCVs.filter(
                                    (url) => url !== candidate.cvFile
                                  )
                                );
                              }
                            }}
                            disabled={!candidate.cvFile}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src="/api/placeholder/40/40"
                                alt={`${candidate.applicant.firstName} ${candidate.applicant.lastName}`}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                {`${candidate.applicant.firstName} ${candidate.applicant.lastName}`
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {`${candidate.applicant.firstName} ${candidate.applicant.lastName}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                {candidate.applicant.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {candidate.jobOffer.title}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {candidate.coverLetter}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(candidate.status)}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const interestStatus = getCompanyInterestStatus(
                              candidate.id
                            );
                            return interestStatus ? (
                              getInterestStatusBadge(interestStatus)
                            ) : (
                              <span className="text-sm text-gray-400">
                                Sin interés
                              </span>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">0</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(candidate.appliedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setSelectedCandidate(candidate);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </Dialog>
                              <DropdownMenuItem
                                onClick={() => handleOpenChat(candidate)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chat
                              </DropdownMenuItem>
                              {candidate.cvFile && (
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Descargar CV
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {!hasCompanyInterest(candidate.id) ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleExpressInterest(candidate)
                                  }
                                >
                                  <Heart className="mr-2 h-4 w-4" />
                                  Expresar Interés
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateInterestStatus(
                                        candidate.id,
                                        "CONTACTED"
                                      )
                                    }
                                    disabled={
                                      getCompanyInterestStatus(candidate.id) ===
                                      "CONTACTED"
                                    }
                                  >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Marcar como Contactado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateInterestStatus(
                                        candidate.id,
                                        "INTERVIEW_SCHEDULED"
                                      )
                                    }
                                    disabled={
                                      getCompanyInterestStatus(candidate.id) ===
                                      "INTERVIEW_SCHEDULED"
                                    }
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Programar Entrevista
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateInterestStatus(
                                        candidate.id,
                                        "HIRED"
                                      )
                                    }
                                    disabled={
                                      getCompanyInterestStatus(candidate.id) ===
                                      "HIRED"
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Marcar como Contratado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateInterestStatus(
                                        candidate.id,
                                        "NOT_INTERESTED"
                                      )
                                    }
                                    disabled={
                                      getCompanyInterestStatus(candidate.id) ===
                                      "NOT_INTERESTED"
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    No Interesado
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(candidate, "PRE_SELECTED")
                                }
                                disabled={candidate.status === "PRE_SELECTED"}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Preseleccionar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRejectClick(candidate)}
                                disabled={candidate.status === "REJECTED"}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Rechazar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Página {candidatesData.pagination.page} de{" "}
                  {candidatesData.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === candidatesData.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Candidate Details Dialog */}
      {selectedCandidate && (
        <Dialog
          open={!!selectedCandidate}
          onOpenChange={() => setSelectedCandidate(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Candidato</DialogTitle>
              <DialogDescription>
                Información completa de la aplicación de{" "}
                {`${selectedCandidate.applicant.firstName} ${selectedCandidate.applicant.lastName}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src="/api/placeholder/64/64"
                    alt={`${selectedCandidate.applicant.firstName} ${selectedCandidate.applicant.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {`${selectedCandidate.applicant.firstName} ${selectedCandidate.applicant.lastName}`
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {`${selectedCandidate.applicant.firstName} ${selectedCandidate.applicant.lastName}`}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedCandidate.applicant.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedCandidate.status)}
                    {selectedCandidate.rating &&
                      renderStars(selectedCandidate.rating)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Puesto:</span>{" "}
                      {selectedCandidate.jobOffer.title}
                    </div>
                    <div>
                      <span className="font-medium">Aplicó:</span>{" "}
                      {formatDate(selectedCandidate.appliedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cover Letter */}
              {selectedCandidate.coverLetter && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Carta de Presentación
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedCandidate.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Question Answers */}
              {selectedCandidate.questionAnswers &&
                selectedCandidate.questionAnswers.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Respuestas a Preguntas
                    </h4>
                    <div className="space-y-4">
                      {selectedCandidate.questionAnswers.map(
                        (answer: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h5 className="font-medium mb-2">
                              {answer.question}
                            </h5>
                            <p className="text-sm text-gray-700">
                              {answer.answer}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Company Notes */}
              {selectedCandidate.notes && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Notas de la Empresa
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedCandidate.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {selectedCandidate.cvFile && (
                  <Button variant="outline" asChild>
                    <a
                      href={selectedCandidate.cvFile}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver CV
                    </a>
                  </Button>
                )}
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
                <Button onClick={() => openUpdateDialog(selectedCandidate)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Candidate Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Candidato</DialogTitle>
            <DialogDescription>
              Actualiza el estado, calificación y notas del candidato
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={candidateStatus}
                onValueChange={(value) =>
                  setCandidateStatus(value as ApplicationStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SENT">Enviado</SelectItem>
                  <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                  <SelectItem value="PRE_SELECTED">Preseleccionado</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                  <SelectItem value="HIRED">Contratado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rating">Calificación (1-5 estrellas)</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCandidateRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= candidateRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCandidateRating(0)}
                  className="ml-2"
                >
                  Limpiar
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Agrega notas sobre el candidato..."
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateSubmit}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Optional Rejection Message Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Candidato</DialogTitle>
            <DialogDescription>
              Puedes agregar una respuesta opcional para que el joven sepa el
              motivo del rechazo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejection-message">
              Mensaje para el candidato (opcional)
            </Label>
            <Textarea
              id="rejection-message"
              placeholder="Explica brevemente el motivo del rechazo (opcional)"
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Confirmar Rechazo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chat con Candidato</DialogTitle>
            <DialogDescription>
              Conversación con{" "}
              {selectedCandidate
                ? `${selectedCandidate.applicant.firstName} ${selectedCandidate.applicant.lastName}`
                : "el candidato"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-[600px]">
            {/* Chat Header with Refresh */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/api/placeholder/32/32"
                    alt={`${selectedCandidate?.applicant.firstName} ${selectedCandidate?.applicant.lastName}`}
                  />
                  <AvatarFallback className="text-sm">
                    {selectedCandidate
                      ? `${selectedCandidate.applicant.firstName.charAt(0)}${selectedCandidate.applicant.lastName.charAt(0)}`
                      : "CD"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedCandidate
                      ? `${selectedCandidate.applicant.firstName} ${selectedCandidate.applicant.lastName}`
                      : "Candidato"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCandidate?.jobOffer?.title || "Puesto"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMessages}
                disabled={messagesLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {messagesLoading ? "Cargando..." : "Recargar"}
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Cargando mensajes...
                    </p>
                  </div>
                </div>
              ) : messageError ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-red-400 mb-4 mx-auto" />
                  <p className="text-sm text-gray-600 mb-4">{messageError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMessages}
                    disabled={messagesLoading}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <p className="text-muted-foreground">No hay mensajes aún</p>
                  <p className="text-sm text-gray-500">
                    Inicia la conversación enviando un mensaje
                  </p>
                </div>
              ) : (
                (messages || []).map((message) => {
                  const isOwnMessage = message.senderType === "COMPANY";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}
                      >
                        <div
                          className={`text-xs mb-1 ${
                            isOwnMessage
                              ? "text-right text-blue-600"
                              : "text-left text-gray-600"
                          }`}
                        >
                          {isOwnMessage
                            ? "Tú"
                            : selectedCandidate?.applicant.firstName ||
                              "Candidato"}
                        </div>
                        {/* Message bubble */}
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isOwnMessage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
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
                })
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={messageSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || messageSending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {messageError && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">{messageError}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Express Interest Modal */}
      <Dialog open={showInterestModal} onOpenChange={setShowInterestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Expresar Interés</DialogTitle>
            <DialogDescription>
              Expresa tu interés en este candidato y agrega un mensaje opcional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedCandidateForInterest && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="/api/placeholder/40/40"
                    alt={`${selectedCandidateForInterest.applicant.firstName} ${selectedCandidateForInterest.applicant.lastName}`}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {`${selectedCandidateForInterest.applicant.firstName} ${selectedCandidateForInterest.applicant.lastName}`
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">
                    {`${selectedCandidateForInterest.applicant.firstName} ${selectedCandidateForInterest.applicant.lastName}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCandidateForInterest.jobOffer.title}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="interest-message">Mensaje (opcional)</Label>
              <Textarea
                id="interest-message"
                placeholder="Agrega un mensaje personalizado para el candidato..."
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleConfirmInterest}
              disabled={expressInterest.isPending}
              className="flex-1"
            >
              {expressInterest.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Expresando...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Expresar Interés
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowInterestModal(false)}
              disabled={expressInterest.isPending}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
