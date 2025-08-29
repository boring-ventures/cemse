"use client";

import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import { useCompaniesByMunicipality } from "@/hooks/useCompanyApi";
import { useCourses } from "@/hooks/useCourseApi";
import { useJobOffers } from "@/hooks/useJobOfferApi";
import { useNewsArticles } from "@/hooks/useNewsArticleApi";
import { useUserColors } from "@/hooks/use-user-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Building2,
  BookOpen,
  Briefcase,
  Newspaper,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Globe,
  Settings,
  Plus,
} from "lucide-react";
import Link from "next/link";

export function DashboardMunicipality() {
  const {
    data: municipality,
    isLoading: municipalityLoading,
    error: municipalityError,
  } = useCurrentMunicipality();
  const { data: companies = [], isLoading: companiesLoading } =
    useCompaniesByMunicipality(municipality?.id || "");
  const { courses = [], loading: coursesLoading } = useCourses();
  const { data: jobs = [], isLoading: jobsLoading } = useJobOffers();
  const { data: news = [], isLoading: newsLoading } = useNewsArticles();
  const colors = useUserColors();

  // Calculate statistics
  const stats = {
    companies: companies.length,
    courses: courses.length,
    jobs: jobs.length,
    news: news.length,
    activeCompanies: companies.filter((c) => c.isActive).length,
    activeCourses: courses.filter((c) => c.isActive).length,
    activeJobs: jobs.filter((j) => j.isActive).length,
    publishedNews: news.filter((n) => n.status === "PUBLISHED").length,
  };

  // Loading state
  if (
    municipalityLoading ||
    companiesLoading ||
    coursesLoading ||
    jobsLoading ||
    newsLoading
  ) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

  // Error state
  if (municipalityError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos del municipio: {municipalityError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Bienvenido al sistema CEMSE - {municipality?.name || "Municipio"}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Empresas</CardTitle>
            <Building2
              className="h-3 sm:h-4 w-3 sm:w-4"
              style={{ color: colors.primaryColor }}
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div
              className="text-lg sm:text-2xl font-bold"
              style={{ color: colors.primaryColor }}
            >
              {stats.companies}
            </div>
            <p className="text-xs text-muted-foreground">
              Empresas registradas
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats.activeCompanies} activas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Cursos</CardTitle>
            <BookOpen
              className="h-3 sm:h-4 w-3 sm:w-4"
              style={{ color: colors.secondaryColor }}
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div
              className="text-lg sm:text-2xl font-bold"
              style={{ color: colors.secondaryColor }}
            >
              {stats.courses}
            </div>
            <p className="text-xs text-muted-foreground">Cursos disponibles</p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats.activeCourses} activos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Empleos</CardTitle>
            <Briefcase
              className="h-3 sm:h-4 w-3 sm:w-4"
              style={{ color: colors.primaryColor }}
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div
              className="text-lg sm:text-2xl font-bold"
              style={{ color: colors.primaryColor }}
            >
              {stats.jobs}
            </div>
            <p className="text-xs text-muted-foreground">Ofertas de trabajo</p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats.activeJobs} activas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Noticias</CardTitle>
            <Newspaper
              className="h-3 sm:h-4 w-3 sm:w-4"
              style={{ color: colors.secondaryColor }}
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div
              className="text-lg sm:text-2xl font-bold"
              style={{ color: colors.secondaryColor }}
            >
              {stats.news}
            </div>
            <p className="text-xs text-muted-foreground">
              Artículos disponibles
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats.publishedNews} publicadas
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Municipality Information and Quick Actions */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Municipality Information */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2
                className="h-4 sm:h-5 w-4 sm:w-5"
                style={{ color: colors.primaryColor }}
              />
              Información del Municipio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {municipality ? (
              <>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-sm">ID:</span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-mono break-all">
                      {municipality.id}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-sm">Municipio:</span>
                    <span className="text-sm" style={{ color: colors.primaryColor }}>
                      {municipality.name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-sm">Departamento:</span>
                    <span className="text-sm">{municipality.department}</span>
                  </div>
                  {municipality.region && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm">Región:</span>
                      <span className="text-sm">{municipality.region}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start sm:items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-xs sm:text-sm break-all">{municipality.email}</span>
                  </div>
                  {municipality.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{municipality.phone}</span>
                    </div>
                  )}
                  {municipality.website && (
                    <div className="flex items-start sm:items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-xs sm:text-sm break-all">{municipality.website}</span>
                    </div>
                  )}
                  {municipality.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{municipality.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Badge
                    variant={municipality.isActive ? "default" : "secondary"}
                    className={municipality.isActive ? "bg-green-600" : ""}
                  >
                    {municipality.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm">
                No se encontró información del municipio
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp
                className="h-4 sm:h-5 w-4 sm:w-5"
                style={{ color: colors.secondaryColor }}
              />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid gap-2 sm:gap-3">
              <Link href="/admin/companies">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <Building2 className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="truncate">Gestionar Empresas</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {stats.companies}
                  </Badge>
                </Button>
              </Link>

              <Link href="/admin/courses">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <BookOpen className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="truncate">Gestionar Cursos</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {stats.courses}
                  </Badge>
                </Button>
              </Link>

              <Link href="/admin/job-offers">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <Briefcase className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="truncate">Gestionar Empleos</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {stats.jobs}
                  </Badge>
                </Button>
              </Link>

              <Link href="/admin/news">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <Newspaper className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="truncate">Gestionar Noticias</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {stats.news}
                  </Badge>
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10">
                  <Settings className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="truncate">Configuración</span>
                </Button>
              </Link>
            </div>

            <div className="pt-3 sm:pt-4 border-t">
              <Link href="/admin/companies">
                <Button
                  className="w-full text-xs sm:text-sm h-9 sm:h-10"
                  style={{ backgroundColor: colors.primaryColor }}
                >
                  <Plus className="mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="truncate">Crear Nueva Empresa</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
