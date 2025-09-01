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
  const [jobFilter, setJobFilter] = useState("all");
  const [sortBy, setSortBy] = useState("appliedAt");
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

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, statusFilter, jobFilter, sortBy, sortOrder, page]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(jobFilter !== "all" && { jobId: jobFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/jobs/candidates?${queryParams}`);
      if (!response.ok) {
        throw new Error("Error al cargar candidatos");
      }

      const data = await response.json();
      setCandidatesData(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los candidatos",
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
            Gestión de Candidatos
          </h1>
          <p className="text-muted-foreground">
            Revisa y gestiona todos los candidatos de tus ofertas de trabajo
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
                  placeholder="Buscar por nombre, email o puesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full md:w-60">
                <SelectValue placeholder="Filtrar por puesto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los puestos</SelectItem>
                {Object.entries(candidatesData.stats.byJob).map(
                  ([jobId, job]) => (
                    <SelectItem key={jobId} value={jobId}>
                      {job.jobTitle} ({job.count})
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
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
                <SelectItem value="appliedAt">Fecha aplicación</SelectItem>
                <SelectItem value="applicantName">Nombre</SelectItem>
                <SelectItem value="rating">Calificación</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Candidatos</CardTitle>
          <CardDescription>
            {candidatesData.candidates.length} de{" "}
            {candidatesData.pagination.total} candidatos
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
                              .filter((c) => c.cvUrl)
                              .map((c) => c.cvUrl!)
                          );
                        } else {
                          setSelectedCVs([]);
                        }
                      }}
                    />
                  </div>
                </TableHead>

                <TableHead>Candidato</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Fecha Aplicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesData.candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCVs.includes(candidate.cvUrl || "")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCVs([...selectedCVs, candidate.cvUrl!]);
                        } else {
                          setSelectedCVs(
                            selectedCVs.filter((url) => url !== candidate.cvUrl)
                          );
                        }
                      }}
                      disabled={!candidate.cvUrl}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src="/api/placeholder/40/40"
                          alt={candidate.applicantName}
                        />
                        <AvatarFallback>
                          {candidate.applicantName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {candidate.applicantName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.applicantEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{candidate.jobTitle}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                  <TableCell>
                    {candidate.rating ? (
                      renderStars(candidate.rating)
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sin calificar
                      </span>
                    )}
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
                          onClick={() => openUpdateDialog(candidate)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Actualizar Estado
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Programar Entrevista
                        </DropdownMenuItem>
                        {candidate.cvUrl && (
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
                {selectedCandidate.applicantName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src="/api/placeholder/64/64"
                    alt={selectedCandidate.applicantName}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedCandidate.applicantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedCandidate.applicantName}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedCandidate.applicantEmail}
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
                      {selectedCandidate.jobTitle}
                    </div>
                    <div>
                      <span className="font-medium">Aplicó:</span>{" "}
                      {formatDate(selectedCandidate.appliedAt)}
                    </div>
                    {selectedCandidate.updatedAt !==
                      selectedCandidate.appliedAt && (
                      <div>
                        <span className="font-medium">Actualizado:</span>{" "}
                        {formatDate(selectedCandidate.updatedAt)}
                      </div>
                    )}
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
              {selectedCandidate.answers &&
                selectedCandidate.answers.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Respuestas a Preguntas
                    </h4>
                    <div className="space-y-4">
                      {selectedCandidate.answers.map((answer, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">
                            {answer.question}
                          </h5>
                          <p className="text-sm text-gray-700">
                            {answer.answer}
                          </p>
                        </div>
                      ))}
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
                {selectedCandidate.cvUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={selectedCandidate.cvUrl}
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
    </div>
  );
}
