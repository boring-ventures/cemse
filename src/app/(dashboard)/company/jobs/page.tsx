"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useToast } from "@/hooks/use-toast";
import { JobOffer } from "@/types/jobs";
import { JobOfferService } from "@/services/job-offer.service";
import { useAuth } from "@/hooks/use-auth";
import { getToken, API_BASE } from "@/lib/api";
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import JobApplicationsModal from "@/components/jobs/company/job-applications-modal";
import { useRouter } from "next/navigation";

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
  const { user, getCurrentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(
    null
  );
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);

  useEffect(() => {
    console.log("🔍 useEffect - User changed:", user);
    console.log("🔍 useEffect - Auth loading:", authLoading);

    if (authLoading) {
      console.log("🔍 useEffect - Auth still loading, waiting...");
      return;
    }

    if (user?.id) {
      console.log("🔍 useEffect - User has ID, fetching job offers");
      fetchJobOffers();
    } else {
      console.log("🔍 useEffect - No user ID, not fetching job offers");
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const fetchJobOffers = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching job offers for company:", user.id);
      console.log("🔍 User object:", user);
      console.log("🔍 API_BASE:", API_BASE);
      console.log("🔍 Token exists:", !!getToken());

      // Collect debug information
      const debug = {
        apiBase: API_BASE,
        tokenExists: !!getToken(),
        user: {
          id: user.id,
          role: user.role,
          company: user.company,
        },
        timestamp: new Date().toISOString(),
      };

      // Obtener el usuario actual del backend para asegurar que tenemos el companyId correcto
      const currentUser = await getCurrentUser();
      debug.currentUser = currentUser
        ? {
            id: currentUser.id,
            role: currentUser.role,
            company: currentUser.company,
          }
        : null;

      // Para empresas, el companyId debe ser el ID de la empresa, no el ID del usuario
      let companyId = user?.id; // Por defecto usar el ID del usuario

      // Si el usuario tiene información de empresa, usar el ID de la empresa
      if (user?.company?.id) {
        companyId = user.company.id;
      } else if (user?.role === "EMPRESAS") {
        // Si es una empresa pero no tiene company.id, usar el ID del usuario
        companyId = user.id;
      }

      debug.companyId = companyId;
      debug.userRole = user.role;
      debug.userCompanyInfo = user.company;

      console.log("🔍 Using companyId:", companyId);
      console.log("🔍 User role:", user.role);
      console.log("🔍 User company info:", user.company);

      // Usar el método correcto con el parámetro companyId
      const data = await JobOfferService.getJobOffersByCompany(companyId);
      console.log("✅ Job offers fetched:", data);
      console.log("✅ Number of job offers:", data?.length || 0);

      debug.jobOffersResult = {
        success: true,
        count: Array.isArray(data) ? data.length : 0,
        data: data,
      };

      setJobOffers(data || []);
      setDebugInfo(debug);
    } catch (error) {
      console.error("❌ Error fetching job offers:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);

      setDebugInfo({
        ...debug,
        jobOffersResult: {
          success: false,
          error: errorMessage,
        },
      });

      toast({
        title: "Error",
        description: "No se pudieron cargar los puestos de trabajo",
        variant: "destructive",
      });
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
    if (
      !confirm("¿Estás seguro de que quieres eliminar este puesto de trabajo?")
    ) {
      return;
    }

    try {
      await JobOfferService.deleteJobOffer(jobOfferId);
      setJobOffers((prev) => prev.filter((job) => job.id !== jobOfferId));
      toast({
        title: "Éxito",
        description: "Puesto de trabajo eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting job offer:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el puesto de trabajo",
        variant: "destructive",
      });
    }
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
    const totalViews = jobOffers.reduce(
      (sum, job) => sum + (job.viewsCount || 0),
      0
    );

    return { total, active, totalApplications, totalViews };
  };

  const stats = getStats();

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No estás autenticado. Por favor inicia sesión.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Puestos de Trabajo</h1>
        <Button onClick={() => router.push("/jobs/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Puesto
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error al cargar empleos:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información de Depuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <div>
                <strong>API Base:</strong> {debugInfo.apiBase}
              </div>
              <div>
                <strong>Token Existe:</strong>{" "}
                {debugInfo.tokenExists ? "Sí" : "No"}
              </div>
              <div>
                <strong>Usuario ID:</strong> {debugInfo.user?.id}
              </div>
              <div>
                <strong>Rol:</strong> {debugInfo.user?.role}
              </div>
              <div>
                <strong>Company ID:</strong> {debugInfo.companyId}
              </div>
              <div>
                <strong>Resultado:</strong>{" "}
                {debugInfo.jobOffersResult?.success ? "Éxito" : "Error"}
              </div>
              {debugInfo.jobOffersResult?.success && (
                <div>
                  <strong>Cantidad de empleos:</strong>{" "}
                  {debugInfo.jobOffersResult.count}
                </div>
              )}
              {debugInfo.jobOffersResult?.error && (
                <div>
                  <strong>Error:</strong> {debugInfo.jobOffersResult.error}
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    console.log("🔍 Testing backend connection...");
                    const response = await fetch("/api/health");
                    const data = await response.json();
                    console.log("✅ Health check result:", data);
                    alert(
                      `Backend health check: ${JSON.stringify(data, null, 2)}`
                    );
                  } catch (error) {
                    console.error("❌ Health check failed:", error);
                    alert(`Health check failed: ${error}`);
                  }
                }}
              >
                Test Backend Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    console.log("🔍 Testing joboffer endpoint...");
                    const token = getToken();
                    const response = await fetch("/api/joboffer", {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    });
                    const data = await response.json();
                    console.log("✅ Joboffer endpoint result:", data);
                    alert(
                      `Joboffer endpoint: ${JSON.stringify(data, null, 2)}`
                    );
                  } catch (error) {
                    console.error("❌ Joboffer endpoint failed:", error);
                    alert(`Joboffer endpoint failed: ${error}`);
                  }
                }}
              >
                Test Joboffer Endpoint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Puestos
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Puestos Activos
                </p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Aplicaciones
                </p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Visualizaciones
                </p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de puestos de trabajo */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Mis Puestos de Trabajo</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchJobOffers}>
              Actualizar
            </Button>
            {error && (
              <Button variant="outline" onClick={fetchJobOffers}>
                Reintentar
              </Button>
            )}
          </div>
        </div>

        {jobOffers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay puestos de trabajo
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primer puesto de trabajo para atraer
                candidatos
              </p>
              <Button onClick={() => router.push("/jobs/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Puesto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobOffers.map((jobOffer) => (
              <Card
                key={jobOffer.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {jobOffer.title}
                        </h3>
                        <Badge className={statusColors[jobOffer.status]}>
                          {statusLabels[jobOffer.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Ubicación:</span>{" "}
                          {jobOffer.location}
                        </div>
                        <div>
                          <span className="font-medium">Tipo de contrato:</span>{" "}
                          {jobOffer.contractType}
                        </div>
                        <div>
                          <span className="font-medium">Modalidad:</span>{" "}
                          {jobOffer.workModality}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setSelectedJobOffer(jobOffer);
                            setIsApplicationsModalOpen(true);
                          }}
                        >
                          <Users className="w-4 h-4" />
                          {jobOffer.applicationsCount || 0} aplicaciones
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {jobOffer.viewsCount || 0} visualizaciones
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Creado {formatDate(jobOffer.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jobs/${jobOffer.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedJobOffer(jobOffer);
                          setIsApplicationsModalOpen(true);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Ver Aplicaciones
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJobOffer(jobOffer.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Aplicaciones */}
      <JobApplicationsModal
        jobOffer={selectedJobOffer}
        isOpen={isApplicationsModalOpen}
        onClose={() => {
          setIsApplicationsModalOpen(false);
          setSelectedJobOffer(null);
        }}
      />
    </div>
  );
}
