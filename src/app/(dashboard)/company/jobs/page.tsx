"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useToast } from "@/hooks/use-toast";
import { JobOffer } from "@/types/jobs";
import { JobOfferService } from "@/services/job-offer.service";
import { useAuthContext } from "@/hooks/use-auth";
import {
  Plus,
  Briefcase,
  Users,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Building,
  Eye,
} from "lucide-react";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  CLOSED: "bg-red-100 text-red-800",
  DRAFT: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  CLOSED: "Cerrado",
  DRAFT: "Borrador",
};

export default function CompanyJobsPage() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const router = useRouter();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    jobOffer: JobOffer | null;
  }>({
    isOpen: false,
    jobOffer: null,
  });

  useEffect(() => {
    if (user?.id) {
      fetchJobOffers();
    }
  }, [user?.id]);

  const fetchJobOffers = async () => {
    if (!user?.id) {
      console.log("No user ID available, cannot fetch job offers");
      return;
    }

    try {
      setLoading(true);

      // Use the same logic as job creation to determine company ID
      const companyId = user.company?.id || user.id;

      console.log("Fetching job offers for company:", {
        userId: user.id,
        userCompanyId: user.company?.id,
        finalCompanyId: companyId,
        userRole: user.role,
        hasCompanyObject: !!user.company,
      });

      // Fetch job offers
      const response = await fetch(`/api/joboffer?companyId=${companyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Error de autenticación",
            description:
              "Sesión expirada. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          return;
        }

        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Job offers fetched successfully:", data);

      const jobOffers = data.jobOffers || data || [];
      setJobOffers(jobOffers);
    } catch (error) {
      console.error("Error fetching job offers:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("Authentication failed") ||
          error.message.includes("401")
        ) {
          toast({
            title: "Error de autenticación",
            description:
              "Sesión expirada. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
        } else if (
          error.message.includes("fetch failed") ||
          error.message.includes("Network")
        ) {
          toast({
            title: "Error de conexión",
            description:
              "No se pudo conectar al servidor. Verifica tu conexión a internet.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los puestos de trabajo",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los puestos de trabajo",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJobOfferCreated = (newJobOffer: JobOffer) => {
    setJobOffers((prev) => [newJobOffer, ...prev]);
    toast({
      title: "Éxito",
      description: "Puesto de trabajo creado correctamente",
    });
  };

  const handleJobOfferUpdated = (updatedJobOffer: JobOffer) => {
    setJobOffers((prev) =>
      prev.map((job) => (job.id === updatedJobOffer.id ? updatedJobOffer : job))
    );
    toast({
      title: "Éxito",
      description: "Puesto de trabajo actualizado correctamente",
    });
  };

  const handleDeleteJobOffer = async (jobOfferId: string) => {
    // Get the job offer details for better confirmation
    const jobOffer = jobOffers.find((job) => job.id === jobOfferId);
    if (!jobOffer) return;

    // Open the confirmation modal
    setDeleteConfirmation({
      isOpen: true,
      jobOffer: jobOffer,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.jobOffer) return;

    const jobOfferId = deleteConfirmation.jobOffer.id;
    const jobTitle = deleteConfirmation.jobOffer.title;

    try {
      setLoading(true);

      // Call the API directly to delete the job offer
      const response = await fetch(`/api/joboffer/${jobOfferId}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Error de autenticación",
            description:
              "Sesión expirada. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          return;
        }

        if (response.status === 403) {
          toast({
            title: "Error de permisos",
            description:
              "No tienes permisos para eliminar esta oferta de trabajo.",
            variant: "destructive",
          });
          return;
        }

        if (response.status === 404) {
          toast({
            title: "Error",
            description: "La oferta de trabajo no fue encontrada.",
            variant: "destructive",
          });
          return;
        }

        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      // Remove the job offer from the local state
      setJobOffers((prev) => prev.filter((job) => job.id !== jobOfferId));

      toast({
        title: "Éxito",
        description: `"${jobTitle}" ha sido eliminado correctamente`,
      });

      // Close the modal
      setDeleteConfirmation({ isOpen: false, jobOffer: null });
    } catch (error) {
      console.error("Error deleting job offer:", error);

      let errorMessage = "No se pudo eliminar el puesto de trabajo";

      if (error instanceof Error) {
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("Network")
        ) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet.";
        } else if (error.message.includes("401")) {
          errorMessage =
            "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (error.message.includes("403")) {
          errorMessage =
            "No tienes permisos para eliminar esta oferta de trabajo.";
        } else if (error.message.includes("404")) {
          errorMessage = "La oferta de trabajo no fue encontrada.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, jobOffer: null });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStats = () => {
    const total = jobOffers.length;
    const active = jobOffers.filter((job) => job.status === "ACTIVE").length;
    const totalApplications = jobOffers.reduce(
      (sum, job) => sum + (job.applicationsCount || 0),
      0
    );

    return { total, active, totalApplications };
  };

  const stats = getStats();

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
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Job Cards Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="flex items-center gap-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AlertDialog
          open={deleteConfirmation.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteConfirmation({ isOpen: false, jobOffer: null });
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar "
                {deleteConfirmation.jobOffer?.title}"?
                <br />
                <br />
                <strong>Esta acción no se puede deshacer</strong> y se
                eliminarán todas las aplicaciones asociadas a esta oferta de
                trabajo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={loading}
              >
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                Gestión de Puestos de Trabajo
              </h1>
              <p className="text-gray-600 text-lg">
                Administra las ofertas de trabajo de tu empresa
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchJobOffers}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button
                onClick={() => router.push("/jobs/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Puesto
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Puestos
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Puestos Activos
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.active}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Aplicaciones
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.totalApplications}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de puestos de trabajo */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mis Puestos de Trabajo</h2>
              <Button variant="outline" onClick={fetchJobOffers}>
                Actualizar
              </Button>
            </div>

            {jobOffers.length === 0 ? (
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="text-center py-16">
                  <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No hay puestos de trabajo
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    Comienza creando tu primer puesto de trabajo para atraer
                    candidatos y encontrar el talento que necesitas.
                  </p>
                  <Button
                    onClick={() => router.push("/jobs/create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Puesto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {jobOffers.map((jobOffer) => (
                  <Card
                    key={jobOffer.id}
                    className="bg-white shadow-sm border-0 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {jobOffer.title}
                            </h3>
                            <Badge
                              className={`${statusColors[jobOffer.status]} px-3 py-1`}
                            >
                              {statusLabels[jobOffer.status]}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">Ubicación:</span>
                              <span>{jobOffer.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">Contrato:</span>
                              <span>{jobOffer.contractType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">Modalidad:</span>
                              <span>{jobOffer.workModality}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                              onClick={() =>
                                router.push(
                                  `/company/jobs/${jobOffer.id}/applications`
                                )
                              }
                            >
                              <Users className="w-4 h-4" />
                              <span className="font-medium">
                                {jobOffer.applicationsCount || 0}
                              </span>
                              <span>aplicaciones</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 p-2 rounded-lg">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Creado {formatDate(jobOffer.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/jobs/${jobOffer.id}/edit`)
                            }
                            className="border-gray-200 hover:border-blue-500 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/company/jobs/${jobOffer.id}/applications`
                              )
                            }
                            className="border-gray-200 hover:border-green-500 hover:text-green-600"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Ver Aplicaciones
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJobOffer(jobOffer.id)}
                            disabled={loading}
                            className="border-gray-200 hover:border-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {loading ? "Eliminando..." : "Eliminar"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          <AlertDialog
            open={deleteConfirmation.isOpen}
            onOpenChange={(open) => {
              if (!open) {
                setDeleteConfirmation({ isOpen: false, jobOffer: null });
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que quieres eliminar "
                  {deleteConfirmation.jobOffer?.title}"?
                  <br />
                  <br />
                  <strong>Esta acción no se puede deshacer</strong> y se
                  eliminarán todas las aplicaciones asociadas a esta oferta de
                  trabajo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelDelete}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={loading}
                >
                  {loading ? "Eliminando..." : "Sí, eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
