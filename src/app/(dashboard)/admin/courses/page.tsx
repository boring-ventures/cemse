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
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCourses } from "@/hooks/useCourseApi";
import { useCourseModules } from "@/hooks/useCourseModuleApi";
import { useModuleLessons } from "@/hooks/useLessonApi";
import { useLessonResources } from "@/hooks/useLessonResourceApi";
import { useCourseProgress } from "@/hooks/useLessonProgressApi";
import { useModuleCertificates } from "@/hooks/useModuleCertificateApi";

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
  totalCertificates: number;
}

export default function CourseManagementPage() {
  const { data: courses, isLoading: loading, error } = useCourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Fetch modules for selected course
  const { data: modulesData } = useCourseModules(selectedCourse || undefined);
  const modules = (modulesData as any)?.modules || [];

  // Fetch lessons for all modules
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [allResources, setAllResources] = useState<any[]>([]);
  const [allCertificates, setAllCertificates] = useState<any[]>([]);

  // Calculate comprehensive stats
  const stats: CourseStats = {
    totalCourses: courses?.length || 0,
    totalStudents: courses?.reduce((sum, course) => sum + (course.studentsCount || 0), 0) || 0,
    totalHours: courses?.reduce((sum, course) => sum + (course.duration || 0), 0) || 0,
    averageRating: (courses && courses.length > 0) ? courses.reduce((sum, course) => sum + (Number(course.rating) || 0), 0) / courses.length : 0,
    completionRate: (courses && courses.length > 0) ? courses.reduce((sum, course) => sum + (Number(course.completionRate) || 0), 0) / courses.length : 0,
    activeCourses: courses?.filter(c => c.isActive).length || 0,
    totalModules: modules.length,
    totalLessons: allLessons.length,
    totalResources: allResources.length,
    totalCertificates: allCertificates.length,
  };

  const filteredCourses = (courses || []).filter((course) => {
    if (!course) return false;
    
    const searchLower = (searchQuery || '').toLowerCase();
    const courseTitle = (course.title || '').toLowerCase();
    const courseDescription = (course.description || '').toLowerCase();
    
    const matchesSearch = courseTitle.includes(searchLower) ||
                         courseDescription.includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || course.isActive === (statusFilter === "active");
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      // Implementation for course deletion
      console.log("Deleting course:", courseId);
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
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <Target className="h-4 w-4" />;
      case 'ASSIGNMENT':
        return <CheckCircle className="h-4 w-4" />;
      case 'LIVE':
        return <Play className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎓 Sistema de Cursos</h1>
          <p className="text-muted-foreground">
            Gestión completa de cursos con módulos, lecciones, recursos y certificados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/courses/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analíticas
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Emitidos por módulos
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
                          <div className="font-medium">{course.title || "Sin título"}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.totalLessons || 0} lecciones • {course.duration || 0}h
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
                          <span>{modules.filter((m: any) => m.courseId === course.id).length} módulos</span>
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
                        variant={(course.isActive || false) ? "default" : "secondary"}
                      >
                        {(course.isActive || false) ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating || 0}
                      </div>
                    </TableCell>

                    <TableCell>
                      {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "N/A"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/progress`}>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Progreso
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/certificates`}>
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Certificados
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/courses/${course.id}/analytics`}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analíticas
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
                No se encontraron cursos
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer curso tipo Platzi"}
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
