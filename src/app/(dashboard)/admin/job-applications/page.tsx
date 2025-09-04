"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Eye, User, Calendar } from "lucide-react";
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
} from "@/components/ui/dialog";
import { JobApplicationDetails } from "./components/JobApplicationDetails";
import { getAuthHeaders, API_BASE } from "@/lib/api";

interface JobApplication {
  id: string;
  jobOfferId: string;
  applicantId: string;
  status: string;
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
  jobOffer?: {
    id: string;
    title: string;
    company?: {
      name: string;
    };
  };
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface JobApplicationsResponse {
  jobApplications: JobApplication[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function JobApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Fetch job applications
  const { data, isLoading, error } = useQuery<JobApplicationsResponse>({
    queryKey: ["admin-job-applications", page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`${API_BASE}/jobapplication?${params}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch job applications");
      }
      const applications = await response.json();

      // Transform the response to match our expected structure
      return {
        jobApplications: Array.isArray(applications) ? applications : [],
        pagination: {
          page: page,
          limit: 10,
          total: Array.isArray(applications) ? applications.length : 0,
          totalPages: 1,
        },
      };
    },
  });

  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "outline" as const, label: "Pendiente" },
      REVIEWING: { variant: "secondary" as const, label: "Revisando" },
      INTERVIEWED: { variant: "default" as const, label: "Entrevistado" },
      ACCEPTED: { variant: "default" as const, label: "Aceptado" },
      REJECTED: { variant: "destructive" as const, label: "Rechazado" },
      WITHDRAWN: { variant: "outline" as const, label: "Retirado" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const getApplicantName = (application: JobApplication) => {
    if (application.applicant) {
      return `${application.applicant.firstName} ${application.applicant.lastName}`;
    }
    return "N/A";
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error al cargar las solicitudes de empleo. Por favor, inténtalo de
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
            Visualización de Candidatos
          </h1>
          <p className="text-muted-foreground">
            Visualiza todas las solicitudes de empleo y candidatos en la
            plataforma
          </p>
        </div>
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
                  placeholder="Buscar candidatos o títulos de trabajo..."
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
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="REVIEWING">Revisando</SelectItem>
                <SelectItem value="INTERVIEWED">Entrevistado</SelectItem>
                <SelectItem value="ACCEPTED">Aceptado</SelectItem>
                <SelectItem value="REJECTED">Rechazado</SelectItem>
                <SelectItem value="WITHDRAWN">Retirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Empleo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              Cargando solicitudes de empleo...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Aplicación</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.jobApplications?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No se encontraron solicitudes de empleo
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.jobApplications?.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-semibold">
                                {getApplicantName(application)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {application.applicant?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {application.jobOffer?.title || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {application.jobOffer?.company?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(application.appliedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(application.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
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

      {/* Job Application Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud de Empleo</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <JobApplicationDetails application={selectedApplication} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
