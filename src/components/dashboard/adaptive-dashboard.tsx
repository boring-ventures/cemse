"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserColors } from "@/hooks/use-user-colors";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DashboardYouth } from "./role-specific/dashboard-youth";
import { DashboardAdolescent } from "./role-specific/dashboard-adolescent";
import { DashboardMunicipality } from "./role-specific/dashboard-municipality";

export function AdaptiveDashboard() {
  const { profile, isLoading, error } = useCurrentUser();

  // Aplicar colores personalizados del municipio
  const colors = useUserColors();

  // Debug logs
  console.log("🔍 AdaptiveDashboard - Debug Info:", {
    profile,
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
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 sm:h-32" />
          <Skeleton className="h-24 sm:h-32" />
          <Skeleton className="h-24 sm:h-32" />
          <Skeleton className="h-24 sm:h-32" />
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Skeleton className="h-64 sm:h-80" />
          <Skeleton className="h-64 sm:h-80" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
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
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Bienvenido al sistema CEMSE</p>
        </div>
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">No hay perfil disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">
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
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bienvenido al sistema CEMSE - {getRoleDisplayName(profile.role)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Cursos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div
                  className="text-lg sm:text-2xl font-bold"
                  style={{ color: colors.primaryColor }}
                >
                  0
                </div>
                <p className="text-xs text-muted-foreground">
                  Cursos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Empleos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div
                  className="text-lg sm:text-2xl font-bold"
                  style={{ color: colors.secondaryColor }}
                >
                  0
                </div>
                <p className="text-xs text-muted-foreground">
                  Ofertas de trabajo
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Noticias</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div
                  className="text-lg sm:text-2xl font-bold"
                  style={{ color: colors.primaryColor }}
                >
                  0
                </div>
                <p className="text-xs text-muted-foreground">
                  Artículos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Progreso</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div
                  className="text-lg sm:text-2xl font-bold"
                  style={{ color: colors.secondaryColor }}
                >
                  {profile.completionPercentage || 0}%
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
                  <span className="font-mono text-xs sm:text-sm break-all">{profile.id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Usuario:</strong>
                  <span className="text-sm" style={{ color: colors.primaryColor }}>
                    {profile.firstName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol:</strong>
                  <span className="text-sm" style={{ color: colors.secondaryColor }}>
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol Original:</strong>
                  <span className="font-mono text-xs break-all">"{profile.role}"</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle
                  className="text-base sm:text-lg font-semibold"
                  style={{ color: colors.secondaryColor }}
                >
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-3 sm:p-4 rounded-lg border-2 border-dashed"
                  style={{
                    borderColor: colors.primaryColor,
                    backgroundColor: `${colors.primaryColor}08`,
                  }}
                >
                  <p className="text-sm text-muted-foreground text-center">
                    Aquí aparecerán las acciones específicas para tu rol.
                  </p>
                  <div className="mt-2 sm:mt-3 text-center">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: colors.secondaryColor,
                        color: "white",
                      }}
                    >
                      Personalizado con colores del municipio
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );

    case "EMPRESAS":
    case "COMPANIES":
      // Generic dashboard for companies with neutral colors
      return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bienvenido al sistema CEMSE - {getRoleDisplayName(profile.role)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Cursos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-gray-700">0</div>
                <p className="text-xs text-muted-foreground">
                  Cursos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Empleos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-gray-700">0</div>
                <p className="text-xs text-muted-foreground">
                  Ofertas de trabajo
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Noticias</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-gray-700">0</div>
                <p className="text-xs text-muted-foreground">
                  Artículos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Progreso</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-gray-700">
                  {profile.completionPercentage || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Completado</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-700">
                  Información del Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">ID:</strong>
                  <span className="font-mono text-xs sm:text-sm break-all">{profile.id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Usuario:</strong>
                  <span className="text-sm text-gray-700">{profile.firstName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol:</strong>
                  <span className="text-sm text-gray-700">
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol Original:</strong>
                  <span className="font-mono text-xs break-all">"{profile.role}"</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-700">
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <p className="text-sm text-muted-foreground text-center">
                    Aquí aparecerán las acciones específicas para tu rol.
                  </p>
                  <div className="mt-2 sm:mt-3 text-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-white">
                      Acciones disponibles
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );

    default:
      // Generic dashboard for other roles (companies, etc.)
      return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bienvenido al sistema CEMSE - {getRoleDisplayName(profile.role)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Cursos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">0</div>
                <p className="text-xs text-muted-foreground">
                  Cursos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Empleos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-orange-600">0</div>
                <p className="text-xs text-muted-foreground">
                  Ofertas de trabajo
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Noticias</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">0</div>
                <p className="text-xs text-muted-foreground">
                  Artículos disponibles
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Progreso</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold text-orange-600">
                  {profile.completionPercentage || 0}%
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
                  <span className="font-mono text-xs sm:text-sm break-all">{profile.id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Usuario:</strong>
                  <span className="text-sm text-blue-600">{profile.firstName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol:</strong>
                  <span className="text-sm text-orange-600">
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded bg-gray-50 gap-1 sm:gap-0">
                  <strong className="text-sm">Rol Original:</strong>
                  <span className="font-mono text-xs break-all">"{profile.role}"</span>
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
