"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserColors } from "@/hooks/use-user-colors";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  RefreshCw,
  BookOpen,
  Briefcase,
  Newspaper,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  MapPin,
} from "lucide-react";
import { DashboardYouth } from "./role-specific/dashboard-youth";
import { DashboardAdolescent } from "./role-specific/dashboard-adolescent";
import { DashboardMunicipality } from "./role-specific/dashboard-municipality";
import { DashboardCompany } from "./role-specific/dashboard-company";
import { Button } from "@/components/ui/button";

export function AdaptiveDashboard() {
  const {
    profile,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const {
    data: dashboardData,
    isLoading: statsLoading,
    error: statsError,
    refetch,
  } = useDashboardStats();

  // Aplicar colores personalizados del municipio
  const colors = useUserColors();

  const isLoading = userLoading || statsLoading;
  const error = userError || statsError;

  // Debug logs
  console.log("🔍 AdaptiveDashboard - Debug Info:", {
    profile,
    dashboardData,
    isLoading,
    error,
    profileRole: profile?.role,
    profileRoleType: typeof profile?.role,
    colors: {
      primaryColor: colors.primaryColor,
      secondaryColor: colors.secondaryColor,
    },
  });

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white shadow-sm border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Cards Skeleton */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for dashboard data specifically
  if (statsLoading && dashboardData) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Actualizando datos...
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Actualizando...
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24 md:h-32" />
          <Skeleton className="h-20 sm:h-24 md:h-32" />
          <Skeleton className="h-20 sm:h-24 md:h-32" />
          <Skeleton className="h-20 sm:h-24 md:h-32" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="bg-white shadow-sm border-0 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Error al cargar el dashboard
                </h3>
                <p className="text-gray-600 mb-6">{error.message}</p>
                <Button onClick={() => refetch()} className="w-full h-11">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard based on user role
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg mt-2">
                Bienvenido al sistema CEMSE
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="bg-white shadow-sm border-0 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No hay perfil disponible
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  No se pudo cargar tu perfil. Por favor, inicia sesión
                  nuevamente.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-11"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar página
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Get role display name
  const getRoleDisplayName = (role: string | null) => {
    if (!role) return "Usuario";

    const roleMap: Record<string, string> = {
      SUPER_ADMIN: "Super Administrador",
      SUPERADMIN: "Super Administrador", // Agregado para compatibilidad
      JOVENES: "Jóvenes",
      ADOLESCENTES: "Adolescentes",
      EMPRESAS: "Empresas",
      GOBIERNOS_MUNICIPALES: "Gobiernos Municipales",
      CENTROS_DE_FORMACION: "Centros de Formación",
      ONGS_Y_FUNDACIONES: "ONGs y Fundaciones",
      CLIENT: "Cliente",
      AGENT: "Agente",
    };

    return roleMap[role] || role;
  };

  // Render role-specific dashboards
  switch (profile.role) {
    case "JOVENES":
      return <DashboardYouth />;

    case "ADOLESCENTES":
      return <DashboardAdolescent />;

    case "GOBIERNOS_MUNICIPALES":
      return <DashboardMunicipality />;

    case "CENTROS_DE_FORMACION":
    case "ONGS_Y_FUNDACIONES":
      // For other institutions, use the generic dashboard with custom colors
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Bienvenido al sistema CEMSE -{" "}
                  {getRoleDisplayName(profile.role)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={statsLoading}
                className="h-11 px-6"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cursos
                  </CardTitle>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.primaryColor }}
                  >
                    {dashboardData?.globalStats.totalCourses || 0}
                  </div>
                  <p className="text-xs text-gray-500">Cursos disponibles</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Empleos
                  </CardTitle>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.secondaryColor }}
                  >
                    {dashboardData?.globalStats.totalJobOffers || 0}
                  </div>
                  <p className="text-xs text-gray-500">Ofertas de trabajo</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Noticias
                  </CardTitle>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.primaryColor }}
                  >
                    {dashboardData?.globalStats.totalNewsArticles || 0}
                  </div>
                  <p className="text-xs text-gray-500">Artículos disponibles</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Progreso
                  </CardTitle>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: colors.secondaryColor }}
                  >
                    {dashboardData?.roleStats.completionPercentage || 0}%
                  </div>
                  <p className="text-xs text-gray-500">Completado</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Cards */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Información del Usuario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Usuario
                      </p>
                      <p className="text-sm text-gray-600">
                        {profile.firstName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Rol</p>
                      <p className="text-sm text-gray-600">
                        {getRoleDisplayName(profile.role)}
                      </p>
                    </div>
                  </div>
                  {dashboardData?.user.municipality && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Municipio
                        </p>
                        <p className="text-sm text-gray-600">
                          {dashboardData.user.municipality}
                        </p>
                      </div>
                    </div>
                  )}
                  {dashboardData?.user.department && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Departamento
                        </p>
                        <p className="text-sm text-gray-600">
                          {dashboardData.user.department}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recentActivities &&
                  dashboardData.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentActivities
                        .slice(0, 5)
                        .map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm">{activity.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(
                                  activity.timestamp
                                ).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600">
                          No hay actividad reciente para mostrar.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {dashboardData?.lastUpdated && (
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Última actualización:{" "}
                  {new Date(dashboardData.lastUpdated).toLocaleString("es-ES")}
                </p>
              </div>
            )}
          </div>
        </div>
      );

    case "EMPRESAS":
    case "COMPANIES":
      return <DashboardCompany />;

    default:
      // Generic dashboard for other roles (companies, etc.)
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Bienvenido al sistema CEMSE -{" "}
                  {getRoleDisplayName(profile.role)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={statsLoading}
                className="h-11 px-6"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cursos
                  </CardTitle>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 text-blue-600">
                    {dashboardData?.globalStats.totalCourses || 0}
                  </div>
                  <p className="text-xs text-gray-500">Cursos disponibles</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Empleos
                  </CardTitle>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 text-green-600">
                    {dashboardData?.globalStats.totalJobOffers || 0}
                  </div>
                  <p className="text-xs text-gray-500">Ofertas de trabajo</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Noticias
                  </CardTitle>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 text-purple-600">
                    {dashboardData?.globalStats.totalNewsArticles || 0}
                  </div>
                  <p className="text-xs text-gray-500">Artículos disponibles</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Progreso
                  </CardTitle>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1 text-orange-600">
                    {dashboardData?.roleStats.completionPercentage || 0}%
                  </div>
                  <p className="text-xs text-gray-500">Completado</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Cards */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Información del Usuario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Usuario
                      </p>
                      <p className="text-sm text-gray-600">
                        {profile.firstName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Rol</p>
                      <p className="text-sm text-gray-600">
                        {getRoleDisplayName(profile.role)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        Aquí aparecerán las acciones específicas para tu rol.
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Acciones disponibles
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
  }
}
