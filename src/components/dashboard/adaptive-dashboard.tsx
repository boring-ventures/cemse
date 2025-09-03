"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserColors } from "@/hooks/use-user-colors";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
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
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 md:w-64" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-72 md:w-96" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
          <Skeleton className="h-20 sm:h-24 md:h-32" />
          <Skeleton className="h-20 sm:h-24 md:h-32" />
          <Skeleton className="h-20 sm:h-24 md:h-32" />
          <Skeleton className="h-20 sm:h-24 md:h-32" />
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-48 sm:h-64 md:h-80" />
          <Skeleton className="h-48 sm:h-64 md:h-80" />
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
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Error al cargar el dashboard: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show dashboard based on user role
  if (!profile) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Bienvenido al sistema CEMSE
          </p>
        </div>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 md:pb-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              No hay perfil disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm md:text-base">
              No se pudo cargar tu perfil. Por favor, inicia sesión nuevamente.
            </p>
          </CardContent>
        </Card>
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
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Bienvenido al sistema CEMSE - {getRoleDisplayName(profile.role)}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Estadísticas del Sistema</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={statsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 md:px-6 pt-2 sm:pt-3 md:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Cursos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 md:px-6 pb-2 sm:pb-3 md:pb-6">
                <div
                  className="text-base sm:text-lg md:text-2xl font-bold"
                  style={{ color: colors.primaryColor }}
                >
                  {dashboardData?.globalStats.totalCourses || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cursos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 md:px-6 pt-2 sm:pt-3 md:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Empleos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 md:px-6 pb-2 sm:pb-3 md:pb-6">
                <div
                  className="text-base sm:text-lg md:text-2xl font-bold"
                  style={{ color: colors.secondaryColor }}
                >
                  {dashboardData?.globalStats.totalJobOffers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ofertas de trabajo
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 md:px-6 pt-2 sm:pt-3 md:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Noticias
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 md:px-6 pb-2 sm:pb-3 md:pb-6">
                <div
                  className="text-base sm:text-lg md:text-2xl font-bold"
                  style={{ color: colors.primaryColor }}
                >
                  {dashboardData?.globalStats.totalNewsArticles || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Artículos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-3 md:px-6 pt-2 sm:pt-3 md:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-3 md:px-6 pb-2 sm:pb-3 md:px-6 pb-2 sm:pb-3 md:pb-6">
                <div
                  className="text-base sm:text-lg md:text-2xl font-bold"
                  style={{ color: colors.secondaryColor }}
                >
                  {dashboardData?.roleStats.completionPercentage ||
                    profile?.profileCompletion ||
                    0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Completado</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle
                  className="text-base sm:text-lg font-semibold"
                  style={{ color: colors.primaryColor }}
                >
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">ID:</strong>
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {profile.id}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Usuario:</strong>
                  <span
                    className="text-sm"
                    style={{ color: colors.primaryColor }}
                  >
                    {profile.firstName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol:</strong>
                  <span
                    className="text-sm"
                    style={{ color: colors.secondaryColor }}
                  >
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol Original:</strong>
                  <span className="font-mono text-xs break-all">
                    "{profile.role}"
                  </span>
                </div>
                {dashboardData?.user.municipality && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                    <strong className="text-sm">Municipio:</strong>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData.user.municipality}
                    </span>
                  </div>
                )}
                {dashboardData?.user.department && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                    <strong className="text-sm">Departamento:</strong>
                    <span className="text-sm text-muted-foreground">
                      {dashboardData.user.department}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle
                  className="text-base sm:text-lg font-semibold"
                  style={{ color: colors.secondaryColor }}
                >
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentActivities &&
                dashboardData.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentActivities
                      .slice(0, 5)
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-2 rounded bg-gray-50"
                        >
                          <span className="text-lg">{activity.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div
                    className="p-3 sm:p-4 rounded-lg border-2 border-dashed"
                    style={{
                      borderColor: colors.primaryColor,
                      backgroundColor: `${colors.primaryColor}08`,
                    }}
                  >
                    <p className="text-sm text-muted-foreground text-center">
                      No hay actividad reciente para mostrar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {dashboardData?.lastUpdated && (
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Última actualización:{" "}
                {new Date(dashboardData.lastUpdated).toLocaleString("es-ES")}
              </p>
            </div>
          )}
        </div>
      );

    case "EMPRESAS":
    case "COMPANIES":
      return <DashboardCompany />;

    default:
      // Generic dashboard for other roles (companies, etc.)
      return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bienvenido al sistema CEMSE - {getRoleDisplayName(profile.role)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Cursos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {dashboardData?.globalStats.totalCourses || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cursos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Empleos
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-orange-600">
                  {dashboardData?.globalStats.totalJobOffers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ofertas de trabajo
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Noticias
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {dashboardData?.globalStats.totalNewsArticles || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Artículos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-orange-600">
                  {dashboardData?.roleStats.completionPercentage ||
                    profile?.profileCompletion ||
                    0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Completado</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-blue-600">
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">ID:</strong>
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {profile.id}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Usuario:</strong>
                  <span className="text-sm text-blue-600">
                    {profile.firstName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol:</strong>
                  <span className="text-sm text-orange-600">
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol Original:</strong>
                  <span className="font-mono text-xs break-all">
                    "{profile.role}"
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-orange-600">
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 sm:p-4 rounded-lg border-2 border-dashed border-blue-600 bg-blue-50">
                  <p className="text-sm text-muted-foreground text-center">
                    Aquí aparecerán las acciones específicas para tu rol.
                  </p>
                  <div className="mt-2 sm:mt-3 text-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-600 text-white">
                      Acciones disponibles
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
  }
}
