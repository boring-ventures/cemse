"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CourseCategory, CourseLevel } from "@/types/courses";
import { Course } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Users,
  BookOpen,
  Clock,
  Star,
  BarChart3,
  Award,
  Layers,
  FileText,
  Video,
  Download,
  Play,
  CheckCircle,
  Lock,
  Unlock,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCourses, useDeleteCourse } from "@/hooks/useCourseApi";
import { useCurrentUser } from "@/hooks/use-current-user";

interface CourseStats {
  totalCourses: number;
  totalStudents: number;
  totalHours: number;
  averageRating: number;
  completionRate: number;
  activeCourses: number;
  totalModules: number;
  totalLessons: number;
  totalResources: number;
}

export default function CourseManagementPage() {
  const { profile: currentUser } = useCurrentUser();
  const { data: courses, isLoading: loading, error } = useCourses();
  const deleteCourseMutation = useDeleteCourse();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter courses to only show those created by the current user
  const userCourses =
    courses?.filter((course) => course.instructorId === currentUser?.id) || [];

  // Debug logging
  console.log("🔍 Course filtering:", {
    totalCourses: courses?.length || 0,
    currentUserId: currentUser?.id,
    userCoursesCount: userCourses.length,
    userCourses: userCourses.map((c) => ({
      id: c.id,
      title: c.title,
      instructorId: c.instructorId,
    })),
  });

  // Fetch modules for all user courses
  const [allModules, setAllModules] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [allResources, setAllResources] = useState<any[]>([]);

  // Fetch data for all user courses
  useEffect(() => {
    const fetchCourseData = async () => {
      if (userCourses.length === 0) return;

      try {
        // Fetch modules for all courses
        const modulesPromises = userCourses.map((course) =>
          fetch(`/api/courses/${course.id}/modules`)
            .then((res) => res.json())
            .then((data) => {
              // Add courseId to each module for proper filtering
              const modules = data.modules || [];
              return modules.map((module: any) => ({
                ...module,
                courseId: course.id,
              }));
            })
            .catch(() => [])
        );

        const allModulesData = await Promise.all(modulesPromises);
        const flatModules = allModulesData.flat();

        // Debug logging
        console.log("🔍 Modules data:", {
          userCourses: userCourses.map((c) => ({ id: c.id, title: c.title })),
          allModulesData,
          flatModules: flatModules.map((m) => ({
            id: m.id,
            title: m.title,
            courseId: m.courseId,
          })),
        });

        setAllModules(flatModules);

        // Fetch lessons for all modules
        if (flatModules.length > 0) {
          const lessonsPromises = flatModules.map((module) =>
            fetch(`/api/modules/${module.id}/lessons`)
              .then((res) => res.json())
              .then((data) => data.lessons || [])
              .catch(() => [])
          );

          const allLessonsData = await Promise.all(lessonsPromises);
          const flatLessons = allLessonsData.flat();
          setAllLessons(flatLessons);

          // Fetch resources for all lessons
          if (flatLessons.length > 0) {
            const resourcesPromises = flatLessons.map((lesson) =>
              fetch(`/api/lessons/${lesson.id}/resources`)
                .then((res) => res.json())
                .then((data) => data.resources || [])
                .catch(() => [])
            );

            const allResourcesData = await Promise.all(resourcesPromises);
            const flatResources = allResourcesData.flat();
            setAllResources(flatResources);
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    fetchCourseData();
  }, [userCourses]);

  // Calculate comprehensive stats based on user's courses only
  const stats: CourseStats = {
    totalCourses: userCourses.length,
    totalStudents:
      userCourses.reduce(
        (sum, course) => sum + (course.studentsCount || 0),
        0
      ) || 0,
    totalHours:
      userCourses.reduce((sum, course) => sum + (course.duration || 0), 0) || 0,
    averageRating:
      userCourses && userCourses.length > 0
        ? userCourses.reduce(
            (sum, course) => sum + (Number(course.rating) || 0),
            0
          ) / userCourses.length
        : 0,
    completionRate:
      userCourses && userCourses.length > 0
        ? userCourses.reduce(
            (sum, course) => sum + (Number(course.completionRate) || 0),
            0
          ) / userCourses.length
        : 0,
    activeCourses: userCourses.filter((c) => c.isActive).length || 0,
    totalModules: allModules.length,
    totalLessons: allLessons.length,
    totalResources: allResources.length,
    totalCertificates: 0, // Removed certificates
  };

  const filteredCourses = userCourses.filter((course) => {
    if (!course) return false;

    const searchLower = (searchQuery || "").toLowerCase();
    const courseTitle = (course.title || "").toLowerCase();
    const courseDescription = (course.description || "").toLowerCase();

    const matchesSearch =
      courseTitle.includes(searchLower) ||
      courseDescription.includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || course.isActive === (statusFilter === "active");
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      try {
        console.log("🗑️ Starting course deletion for:", courseId);
        console.log("🗑️ Current user:", currentUser);
        console.log("🗑️ Delete mutation state:", deleteCourseMutation);

        await deleteCourseMutation.mutateAsync(courseId);
        console.log("✅ Course deleted successfully:", courseId);
      } catch (error) {
        console.error("❌ Error deleting course:", error);
        console.error("❌ Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        alert("Error al eliminar el curso. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const handleDuplicateCourse = async (courseId: string) => {
    const course = courses?.find((c) => c.id === courseId);
    if (course) {
      console.log("Duplicating course:", courseId);
    }
  };

  const getCategoryLabel = (category: CourseCategory) => {
    const labels = {
      [CourseCategory.SOFT_SKILLS]: "Habilidades Blandas",
      [CourseCategory.BASIC_COMPETENCIES]: "Competencias Básicas",
      [CourseCategory.JOB_PLACEMENT]: "Inserción Laboral",
      [CourseCategory.ENTREPRENEURSHIP]: "Emprendimiento",
      [CourseCategory.TECHNICAL_SKILLS]: "Habilidades Técnicas",
      [CourseCategory.DIGITAL_LITERACY]: "Alfabetización Digital",
      [CourseCategory.COMMUNICATION]: "Comunicación",
      [CourseCategory.LEADERSHIP]: "Liderazgo",
    };
    return labels[category] || category;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "TEXT":
        return <FileText className="h-4 w-4" />;
      case "QUIZ":
        return <Target className="h-4 w-4" />;
      case "ASSIGNMENT":
        return <CheckCircle className="h-4 w-4" />;
      case "LIVE":
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // If no user is authenticated, show a message
  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acceso requerido</h3>
          <p className="text-muted-foreground mb-4">
            Debes iniciar sesión para ver tus cursos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎓 Mis Cursos</h1>
          <p className="text-muted-foreground">
            Gestión de tus cursos creados con módulos, lecciones y recursos
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCourses} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModules}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLessons} lecciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              PDFs, videos, documentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate.toFixed(1)}% completan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value={CourseCategory.SOFT_SKILLS}>
                    Habilidades Blandas
                  </SelectItem>
                  <SelectItem value={CourseCategory.ENTREPRENEURSHIP}>
                    Emprendimiento
                  </SelectItem>
                  <SelectItem value={CourseCategory.TECHNICAL_SKILLS}>
                    Habilidades Técnicas
                  </SelectItem>
                  <SelectItem value={CourseCategory.DIGITAL_LITERACY}>
                    Alfabetización Digital
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Estructura</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses?.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {course.title || "Sin título"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {course.totalLessons || 0} lecciones •{" "}
                            {course.duration || 0}h
                          </div>
                          <div className="flex gap-1 mt-1">
                            {(course.isMandatory || false) && (
                              <Badge variant="destructive" className="text-xs">
                                Obligatorio
                              </Badge>
                            )}
                            {(course.certification || false) && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Certificado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Layers className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {(() => {
                              const courseModules = allModules.filter(
                                (m: any) => m.courseId === course.id
                              );
                              console.log(
                                `🔍 Course ${course.title} (${course.id}):`,
                                {
                                  courseId: course.id,
                                  allModulesCount: allModules.length,
                                  courseModules,
                                  courseModulesCount: courseModules.length,
                                }
                              );
                              return courseModules.length;
                            })()}{" "}
                            módulos
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>{course.totalLessons || 0} lecciones</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span>{course.totalResources || 0} recursos</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {course.instructor?.name || "Sin instructor"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {course.instructor?.title || "No especificado"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(course.category as CourseCategory)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {(course.studentsCount || 0).toLocaleString()}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          course.isActive || false ? "default" : "secondary"
                        }
                      >
                        {course.isActive || false ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating || 0}
                      </div>
                    </TableCell>

                    <TableCell>
                      {course.updatedAt
                        ? new Date(course.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/courses/${course.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver curso
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/modules`}>
                              <Layers className="h-4 w-4 mr-2" />
                              Gestionar módulos
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/students`}>
                              <Users className="h-4 w-4 mr-2" />
                              Ver estudiantes
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDuplicateCourse(course.id)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCourses?.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "No se encontraron cursos con los filtros aplicados"
                  : "No tienes cursos creados aún"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer curso para compartir tu conocimiento"}
              </p>
              <Button asChild>
                <Link href="/admin/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Curso
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
