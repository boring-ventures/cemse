"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { JobOfferForm } from "./components/JobOfferForm";
import { JobOfferDetails } from "./components/JobOfferDetails";
import { getAuthHeaders } from "@/lib/api";

interface JobOffer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  municipality: string;
  department: string;
  contractType: string;
  workModality: string;
  workSchedule: string;
  experienceLevel: string;
  educationRequired?: string;
  skillsRequired: string[];
  desiredSkills: string[];
  applicationDeadline?: string;
  status: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  viewsCount: number;
  applicationsCount: number;
  featured: boolean;
  publishedAt: string;
  expiresAt?: string;
  company?: {
    id: string;
    name: string;
    businessSector?: string;
  };
  applications?: Array<{
    id: string;
    status: string;
    appliedAt: string;
    applicant: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
    };
  }>;
}

interface JobOffersResponse {
  jobOffers: JobOffer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function JobOffersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingJobOffer, setEditingJobOffer] = useState<JobOffer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch job offers
  const { data, isLoading, error } = useQuery<JobOffersResponse>({
    queryKey: ["admin-job-offers", page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/job-offers?${params}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Error al cargar las ofertas de empleo");
      }
      const jobOffers = await response.json();

      console.log("🔍 Respuesta de ofertas de empleo:", jobOffers);
      console.log("🔍 Tipo de respuesta:", typeof jobOffers);
      console.log("🔍 Es array:", Array.isArray(jobOffers));

      // Transform the response to match our expected structure
      // Handle different possible response formats
      let jobOffersArray = [];
      if (Array.isArray(jobOffers)) {
        jobOffersArray = jobOffers;
      } else if (
        jobOffers &&
        typeof jobOffers === "object" &&
        Array.isArray(jobOffers.jobOffers)
      ) {
        jobOffersArray = jobOffers.jobOffers;
      } else if (
        jobOffers &&
        typeof jobOffers === "object" &&
        Array.isArray(jobOffers.data)
      ) {
        jobOffersArray = jobOffers.data;
      } else {
        console.warn("⚠️ Formato de respuesta de ofertas de empleo inesperado:", jobOffers);
        jobOffersArray = [];
      }

      return {
        jobOffers: jobOffersArray,
        pagination: {
          page: page,
          limit: 10,
          total: jobOffersArray.length,
          totalPages: 1,
        },
      };
    },
  });

  // Delete job offer mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/job-offers/${id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Error al eliminar la oferta de empleo");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-offers"] });
      toast.success("Oferta de empleo eliminada exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar la oferta de empleo");
      console.error("Error de eliminación:", error);
    },
  });

  // Create job offer mutation
  const createMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await fetch("/api/admin/job-offers", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear la oferta de empleo");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-offers"] });
      toast.success("Oferta de empleo creada exitosamente");
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear la oferta de empleo");
    },
  });

  // Update job offer mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/job-offers/${id}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar la oferta de empleo");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-offers"] });
      toast.success("Oferta de empleo actualizada exitosamente");
      setIsEditDialogOpen(false);
      setEditingJobOffer(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar la oferta de empleo");
    },
  });

  const handleDelete = (jobOffer: JobOffer) => {
    deleteMutation.mutate(jobOffer.id);
  };

  const handleCreate = (jobData: any) => {
    createMutation.mutate(jobData);
  };

  const handleUpdate = (jobData: any) => {
    if (editingJobOffer) {
      updateMutation.mutate({ id: editingJobOffer.id, data: jobData });
    }
  };

  const handleEdit = (jobOffer: JobOffer) => {
    setEditingJobOffer(jobOffer);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (jobOffer: JobOffer) => {
    setSelectedJobOffer(jobOffer);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "default" as const, label: "Activo" },
      PAUSED: { variant: "secondary" as const, label: "Pausado" },
      CLOSED: { variant: "destructive" as const, label: "Cerrado" },
      DRAFT: { variant: "outline" as const, label: "Borrador" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatSalary = (min?: number, max?: number, currency = "BOB") => {
    if (!min && !max) return "No especificado";
    if (min && max)
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `${min.toLocaleString()} ${currency}`;
    if (max) return `${max.toLocaleString()} ${currency}`;
    return "No especificado";
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error al cargar las ofertas de empleo. Por favor, inténtalo de
              nuevo.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Empleos
          </h1>
          <p className="text-muted-foreground">
            Administra todas las ofertas de empleo en la plataforma
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Publicar Empleo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Publicar Nuevo Empleo</DialogTitle>
              <DialogDescription>
                Completa los detalles para crear una nueva oferta de empleo.
              </DialogDescription>
            </DialogHeader>
            <JobOfferForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar ofertas de empleo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="PAUSED">Pausado</SelectItem>
                <SelectItem value="CLOSED">Cerrado</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ofertas de Empleo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              Cargando ofertas de empleo...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Salario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Solicitudes</TableHead>
                    <TableHead>Vistas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.jobOffers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No se encontraron ofertas de empleo
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.jobOffers?.map((jobOffer) => (
                      <TableRow key={jobOffer.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">
                              {jobOffer.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {jobOffer.experienceLevel}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {jobOffer.company?.name || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {jobOffer.company?.businessSector || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{jobOffer.location}</div>
                            <div className="text-sm text-muted-foreground">
                              {jobOffer.municipality}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{jobOffer.contractType}</div>
                            <div className="text-sm text-muted-foreground">
                              {jobOffer.workModality}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatSalary(
                            jobOffer.salaryMin,
                            jobOffer.salaryMax,
                            jobOffer.salaryCurrency
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(jobOffer.status)}</TableCell>
                        <TableCell>{jobOffer.applicationsCount}</TableCell>
                        <TableCell>{jobOffer.viewsCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(jobOffer)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(jobOffer)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Eliminar Oferta de Empleo
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro de que quieres eliminar "
                                      {jobOffer.title}"? Esta acción no se puede
                                      deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(jobOffer)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando{" "}
                    {(data.pagination.page - 1) * data.pagination.limit + 1} a{" "}
                    {Math.min(
                      data.pagination.page * data.pagination.limit,
                      data.pagination.total
                    )}{" "}
                    de {data.pagination.total} resultados
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Job Offer Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Oferta de Empleo</DialogTitle>
          </DialogHeader>
          {selectedJobOffer && <JobOfferDetails jobOffer={selectedJobOffer} />}
        </DialogContent>
      </Dialog>

      {/* Edit Job Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Oferta de Empleo</DialogTitle>
            <DialogDescription>
              Actualiza los detalles de la oferta de empleo.
            </DialogDescription>
          </DialogHeader>
          {editingJobOffer && (
            <JobOfferForm
              jobOffer={editingJobOffer}
              onSubmit={handleUpdate}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
