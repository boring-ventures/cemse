"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid3X3,
  List,
  BookOpen,
  Play,
  Award,
  Target,
  User,
  RefreshCw,
  AlertCircle,
  Filter,
} from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Course } from "@/types/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentMunicipality } from "@/hooks/useMunicipalityApi";
import { isMunicipalityRole } from "@/lib/utils";

export default function CoursesPage() {
  const router = useRouter();

  // Get current user and municipality info for filtering
  const { profile } = useCurrentUser();
  const { data: currentMunicipality } = useCurrentMunicipality();

  // Determine if user is municipality and get municipality ID
  const isMunicipality = isMunicipalityRole(profile?.role);
  const municipalityId = isMunicipality ? currentMunicipality?.id : undefined;

  const { courses, loading, error } = useCourses(municipalityId);
  const {
    enrollments,
    loading: enrollmentsLoading,
    isEnrolledInCourse,
  } = useEnrollments();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Estadísticas
  const stats = {
    total: courses?.length || 0,
    inProgress: enrollments.filter((e) => e.status === "IN_PROGRESS").length,
    completed: enrollments.filter((e) => e.status === "COMPLETED").length,
    certificates: enrollments.filter((e) => e.status === "COMPLETED").length,
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      SOFT_SKILLS: "Habilidades Blandas",
      BASIC_COMPETENCIES: "Competencias Básicas",
      JOB_PLACEMENT: "Inserción Laboral",
      ENTREPRENEURSHIP: "Emprendimiento",
      TECHNICAL_SKILLS: "Habilidades Técnicas",
      DIGITAL_LITERACY: "Alfabetización Digital",
      COMMUNICATION: "Comunicación",
      LEADERSHIP: "Liderazgo",
    };
    return labels[category] || category;
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      BEGINNER: "Principiante",
      INTERMEDIATE: "Intermedio",
      ADVANCED: "Avanzado",
    };
    return labels[level] || level;
  };

  const filteredCourses =
    courses?.filter((course: Course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.shortDescription
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || course.category === categoryFilter;
      const matchesLevel =
        levelFilter === "all" || course.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    }) || [];

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "SOFT_SKILLS", label: "Habilidades Blandas" },
    { value: "BASIC_COMPETENCIES", label: "Competencias Básicas" },
    { value: "JOB_PLACEMENT", label: "Inserción Laboral" },
    { value: "ENTREPRENEURSHIP", label: "Emprendimiento" },
    { value: "TECHNICAL_SKILLS", label: "Habilidades Técnicas" },
    { value: "DIGITAL_LITERACY", label: "Alfabetización Digital" },
    { value: "COMMUNICATION", label: "Comunicación" },
    { value: "LEADERSHIP", label: "Liderazgo" },
  ];

  const levels = [
    { value: "all", label: "Todos los niveles" },
    { value: "BEGINNER", label: "Principiante" },
    { value: "INTERMEDIATE", label: "Intermedio" },
    { value: "ADVANCED", label: "Avanzado" },
  ];

  if (loading || enrollmentsLoading) {
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
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="bg-white shadow-sm border-0 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="w-full h-32 rounded-lg" />
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Explorar Cursos
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Descubre cursos para desarrollar tus habilidades y competencias
            </p>
          </div>
          <Button
            onClick={() => router.push("/my-courses")}
            variant="outline"
            className="h-11 px-6"
          >
            <User className="h-4 w-4 mr-2" />
            Mis Cursos
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-500">Cursos Disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                  <p className="text-sm text-gray-500">En Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                  <p className="text-sm text-gray-500">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.certificates}
                  </p>
                  <p className="text-sm text-gray-500">Certificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-sm border-0 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar cursos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-48 h-12 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40 h-12 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-12 px-4"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-12 px-4"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredCourses.length} cursos encontrados
            </p>
          </div>

          {error && (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Error al cargar los cursos
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="h-11 px-6"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredCourses.length === 0 && !loading && (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No se encontraron cursos
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ||
                  categoryFilter !== "all" ||
                  levelFilter !== "all"
                    ? "Intenta ajustar tus filtros de búsqueda para encontrar más cursos."
                    : "No hay cursos disponibles en este momento."}
                </p>
                {(searchQuery ||
                  categoryFilter !== "all" ||
                  levelFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setLevelFilter("all");
                    }}
                    variant="outline"
                    className="h-11 px-6"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                : "grid gap-6"
            }
          >
            {filteredCourses.map((course) => {
              const enrollment = isEnrolledInCourse(course.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  viewMode={viewMode}
                  enrollment={
                    enrollment
                      ? {
                          isEnrolled: true,
                          progress: enrollment.progress,
                          status: enrollment.status,
                          enrollmentId: enrollment.id,
                        }
                      : {
                          isEnrolled: false,
                        }
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
