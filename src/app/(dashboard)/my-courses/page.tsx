"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  Award,
  Search,
  Filter,
  TrendingUp,
  Target,
  Calendar,
  Users,
  Star,
} from "lucide-react";
import { useCourseEnrollments } from "@/hooks/useCourseEnrollments";
import { CourseCard } from "@/components/courses/course-card";

export default function MyCoursesPage() {
  const { enrollments, loading, error } = useCourseEnrollments();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calcular estadísticas
  const stats = {
    total: enrollments?.length || 0,
    inProgress: enrollments?.filter(e => e.status === "IN_PROGRESS").length || 0,
    completed: enrollments?.filter(e => e.status === "COMPLETED").length || 0,
    certificates: enrollments?.filter(e => e.status === "COMPLETED").length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "ENROLLED":
        return "bg-yellow-100 text-yellow-800";
      case "DROPPED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completado";
      case "IN_PROGRESS":
        return "En progreso";
      case "ENROLLED":
        return "Inscrito";
      case "DROPPED":
        return "Abandonado";
      default:
        return status;
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes % 60}m`;
  };

  const filteredEnrollments = enrollments?.filter((enrollment) => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Mis Cursos</h1>
            <p className="text-muted-foreground">
              Gestiona tus inscripciones y sigue tu progreso
            </p>
          </div>
          <Button asChild>
            <Link href="/courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Explorar Cursos
            </Link>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Inscrito</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">En Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.certificates}</p>
                  <p className="text-sm text-muted-foreground">Certificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar en mis cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ENROLLED">Inscrito</SelectItem>
                <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="DROPPED">Abandonado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredEnrollments.length} cursos encontrados
          </p>
        </div>

        {error && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error al cargar tus cursos: {error}</p>
            </CardContent>
          </Card>
        )}

        {filteredEnrollments.length === 0 && !loading && (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {stats.total === 0 
                  ? "Aún no te has inscrito a ningún curso" 
                  : "No se encontraron cursos con los filtros aplicados"
                }
              </p>
              {stats.total === 0 && (
                <Button asChild>
                  <Link href="/courses">
                    Explorar Cursos
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Información del curso */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {enrollment.course.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getStatusColor(enrollment.status)}>
                            {getStatusLabel(enrollment.status)}
                          </Badge>
                          <Badge variant="outline">
                            {enrollment.course.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Progreso */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progreso del curso</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Estadísticas del curso */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTimeSpent(enrollment.course.duration || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{enrollment.course.studentCount || 0} estudiantes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>{enrollment.course.rating || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {enrollment.status === "COMPLETED" ? (
                      <Button asChild className="w-full">
                        <Link href="/certificates">
                          <Award className="h-4 w-4 mr-2" />
                          Ver Certificado
                        </Link>
                      </Button>
                    ) : enrollment.status === "IN_PROGRESS" ? (
                      <Button asChild className="w-full">
                        <Link href={`/development/courses/${enrollment.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Continuar
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href={`/development/courses/${enrollment.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Comenzar Curso
                        </Link>
                      </Button>
                    )}

                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/courses/${enrollment.courseId}`}>
                        Ver Detalles
                      </Link>
                    </Button>
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


