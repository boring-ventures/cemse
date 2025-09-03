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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidatesData) {
    return <div>Error al cargar los datos</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Postulaciones de Jóvenes
          </h1>
          <p className="text-muted-foreground">
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
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar CVs Seleccionados
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidatos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidatesData.stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {candidatesData.stats.averageRating.toFixed(1)} ⭐ promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {candidatesData.stats.byStatus.underReview}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Preseleccionados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {candidatesData.stats.byStatus.preSelected}
            </div>
            <p className="text-xs text-muted-foreground">
              Listos para entrevista
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratados</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {candidatesData.stats.byStatus.hired}
            </div>
            <p className="text-xs text-muted-foreground">Proceso exitoso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {candidatesData.stats.byStatus.sent}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendientes de revisar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descripción o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="SENT">Enviado</SelectItem>
                <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                <SelectItem value="PRE_SELECTED">Preseleccionado</SelectItem>
                <SelectItem value="REJECTED">Rechazado</SelectItem>
                <SelectItem value="HIRED">Contratado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Fecha creación</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Postulaciones</CardTitle>
          <CardDescription>
            {candidatesData.candidates.length} de{" "}
            {candidatesData.pagination.total} postulaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedCVs.length === candidatesData.candidates.length
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

                <TableHead>Joven</TableHead>
                <TableHead>Postulación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vistas</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesData.candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCVs.includes(candidate.cvFile || "")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCVs([...selectedCVs, candidate.cvFile!]);
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
                      <Avatar>
                        <AvatarImage
                          src="/api/placeholder/40/40"
                          alt={`${candidate.applicant.firstName} ${candidate.applicant.lastName}`}
                        />
                        <AvatarFallback>
                          {`${candidate.applicant.firstName} ${candidate.applicant.lastName}`
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {`${candidate.applicant.firstName} ${candidate.applicant.lastName}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.applicant.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {candidate.jobOffer.title}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {candidate.coverLetter}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">0</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(candidate.appliedAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              Página {candidatesData.pagination.page} de{" "}
              {candidatesData.pagination.totalPages}
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === candidatesData.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <p className="text-muted-foreground">No hay mensajes aún</p>
                  <p className="text-sm text-gray-500">
                    Inicia la conversación enviando un mensaje
                  </p>
                </div>
              ) : (
                messages.map((message) => {
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
    </div>
  );
}
