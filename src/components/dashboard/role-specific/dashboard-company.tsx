"use client";

import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useCompanyJobOffers } from "@/hooks/use-job-offers";
import { useNewsByType } from "@/hooks/useNewsArticleApi";
import { useCompanyApplications } from "@/hooks/use-job-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Briefcase,
  Newspaper,
  Users,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
} from "lucide-react";
import Link from "next/link";

export function DashboardCompany() {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useCompanyProfile();
  const { data: jobOffers = [], isLoading: jobOffersLoading } =
    useCompanyJobOffers(profile?.id || "", "ACTIVE");
  const { data: news = [], loading: newsLoading } = useNewsByType("COMPANY");
  const { data: applications = [], loading: applicationsLoading } =
    useCompanyApplications();

  // Debug logging
  console.log("🔍 DashboardCompany - Data loaded:", {
    profile,
    profileLoading,
    profileError,
    jobOffers: jobOffers.length,
    jobOffersLoading,
    news: news.length,
    newsLoading,
    applications: applications.length,
    applicationsLoading,
  });

  // Calculate statistics with fallbacks
  const totalJobOffers = jobOffers?.length || 0;
  const activeJobOffers =
    jobOffers?.filter((job) => job.status === "ACTIVE").length || 0;
  const pausedJobOffers =
    jobOffers?.filter((job) => job.status === "PAUSED").length || 0;
  const closedJobOffers =
    jobOffers?.filter((job) => job.status === "CLOSED").length || 0;

  const totalApplications = applications?.length || 0;
  const pendingApplications =
    applications?.filter(
      (app) => app.status === "SENT" || app.status === "UNDER_REVIEW"
    ).length || 0;
  const selectedApplications =
    applications?.filter((app) => app.status === "PRE_SELECTED").length || 0;
  const hiredApplications =
    applications?.filter((app) => app.status === "HIRED").length || 0;

  const companyNews =
    news?.filter(
      (article) =>
        article.authorId === profile?.id || article.authorName === profile?.name
    ).length || 0;

  // Show skeleton while loading
  if (profileLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar el dashboard: {profileError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar el perfil de la empresa.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard de Empresa
        </h1>
        <p className="text-muted-foreground">
          Bienvenido, {profile?.name || "Empresa"} - Gestiona tus ofertas de
          trabajo y actividades
        </p>
      </div>

             {/* Statistics Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Job Offers Card */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ofertas de Trabajo
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalJobOffers}
            </div>
            <p className="text-xs text-muted-foreground">Total de ofertas</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Activas
                </span>
                <span className="font-medium">{activeJobOffers}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Pause className="h-3 w-3 text-yellow-600" />
                  Pausadas
                </span>
                <span className="font-medium">{pausedJobOffers}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  Cerradas
                </span>
                <span className="font-medium">{closedJobOffers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Card */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalApplications}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de aplicaciones
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  Pendientes
                </span>
                <span className="font-medium">{pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  Preseleccionados
                </span>
                <span className="font-medium">{selectedApplications}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Contratados
                </span>
                <span className="font-medium">{hiredApplications}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Card */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Noticias</CardTitle>
            <Newspaper className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {companyNews}
            </div>
            <p className="text-xs text-muted-foreground">
              Artículos publicados
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Contenido propio
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Information and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                <strong className="text-sm">Empresa:</strong>
                <span className="text-sm font-medium text-blue-600">
                  {profile?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                <strong className="text-sm">Sector:</strong>
                <span className="text-sm">
                  {profile?.businessSector || "No especificado"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                <strong className="text-sm">Tamaño:</strong>
                <span className="text-sm">
                  {profile?.companySize || "No especificado"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                <strong className="text-sm">Ubicación:</strong>
                <span className="text-sm">
                  {profile?.municipality?.name || "No especificado"}
                </span>
              </div>
              {profile?.website && (
                <div className="flex justify-between items-center p-2 rounded bg-gray-50">
                  <strong className="text-sm">Sitio Web:</strong>
                  <a
                    href={profile?.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Visitar <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-600">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/company/jobs">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva Oferta de Trabajo
              </Button>
            </Link>

            <Link href="/company/jobs">
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas las Ofertas
              </Button>
            </Link>

            <Link href="/company/youth-applications">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Revisar Candidatos
              </Button>
            </Link>

            <Link href="/company/news">
              <Button className="w-full justify-start" variant="outline">
                <Newspaper className="h-4 w-4 mr-2" />
                Gestionar Noticias
              </Button>
            </Link>

            <Link href="/company/profile">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Job Offers */}
      {totalJobOffers > 0 && !jobOffersLoading ? (
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5" />
              Ofertas de Trabajo Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobOffersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(jobOffers || []).slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {job.title || "Sin título"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {job.location || "Ubicación no especificada"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            job.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {job.status === "ACTIVE"
                            ? "Activa"
                            : job.status === "PAUSED"
                              ? "Pausada"
                              : "Cerrada"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {job.applicationsCount || job.applicationCount || 0}{" "}
                          candidatos
                        </span>
                      </div>
                    </div>
                    <Link href={`/company/jobs/${job.id || "unknown"}`}>
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                ))}
                {totalJobOffers > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/company/jobs">
                      <Button variant="ghost" size="sm">
                        Ver todas las ofertas ({totalJobOffers})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : totalJobOffers === 0 && !jobOffersLoading ? (
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5" />
              Ofertas de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay ofertas de trabajo
              </h3>
              <p className="text-gray-600 mb-4">
                Aún no has creado ninguna oferta de trabajo. Comienza creando tu
                primera oferta.
              </p>
              <Link href="/company/jobs">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Oferta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent Applications */}
      {totalApplications > 0 && !applicationsLoading ? (
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              Candidatos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(applications || []).slice(0, 3).map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {application.applicant?.firstName || "N/A"}{" "}
                        {application.applicant?.lastName || ""}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Aplicó a:{" "}
                        {application.jobOffer?.title || "Oferta no disponible"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            application.status === "HIRED"
                              ? "default"
                              : application.status === "PRE_SELECTED"
                                ? "secondary"
                                : application.status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {application.status === "SENT"
                            ? "Enviada"
                            : application.status === "UNDER_REVIEW"
                              ? "En Revisión"
                              : application.status === "PRE_SELECTED"
                                ? "Preseleccionado"
                                : application.status === "REJECTED"
                                  ? "Rechazado"
                                  : application.status === "HIRED"
                                    ? "Contratado"
                                    : application.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {application.appliedAt
                            ? new Date(
                                application.appliedAt
                              ).toLocaleDateString()
                            : "Fecha no disponible"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/company/jobs/${application.jobOfferId || "unknown"}/candidates`}
                    >
                      <Button size="sm" variant="outline">
                        Ver Candidato
                      </Button>
                    </Link>
                  </div>
                ))}
                {totalApplications > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/company/youth-applications">
                      <Button variant="ghost" size="sm">
                        Ver todos los candidatos ({totalApplications})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : totalApplications === 0 && !applicationsLoading ? (
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              Candidatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay candidatos aún
              </h3>
              <p className="text-gray-600 mb-4">
                Cuando crees ofertas de trabajo, los candidatos aparecerán aquí.
              </p>
              <Link href="/company/jobs">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Oferta de Trabajo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
